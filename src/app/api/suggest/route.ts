import { ConversationRequest, conversationRequestSchema, conversationSuggestionSchema } from '@/types/shared-types';
import { google } from '@ai-sdk/google';
import { streamObject, DeepPartial } from 'ai';
import { defaultLocale, locales, Locale } from '@/locale/config';
import { NextResponse, after } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from '@/lib/prisma-client';
import { Redis } from '@upstash/redis';
import { AISDKExporter } from 'langsmith/vercel';
import { generateSubstantivePrompt } from './lib/prompts';


// Function-calling用に明示的に定義
const model = google("gemini-2.0-flash-lite-preview-02-05")
// 生成中の部分的なデータ型
export type PartialConversationSuggestion = DeepPartial<typeof conversationSuggestionSchema>

// 最大60秒のストリーミングレスポンスを許可
export const maxDuration = 60;


export async function POST(req: Request) {
    try {
        const { getUser } = getKindeServerSession();

        // ユーザー認証
        const user = await getUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized', details: 'User not found' },
                { status: 401 }
            );
        }

        // Check user status and subscription
        const dbUser = await db.user.findUnique({
            where: { kindeId: user.id },
            select: {
                id: true,
                deletedAt: true,
                subscriptions: {
                    select: { status: true }
                },
            }
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: 'Unauthorized', details: 'User not found in database' },
                { status: 401 }
            );
        }

        // Check if user is suspended
        if (dbUser.deletedAt) {
            return NextResponse.json(
                { error: 'Forbidden', details: 'Your account has been suspended' },
                { status: 403 }
            );
        }

        // Check subscription status
        const subscribed = dbUser.subscriptions.some(
            subscription => ['active', 'trialing'].includes(subscription.status)
        );

        if (!subscribed) {
            return NextResponse.json(
                { error: 'Unauthorized', details: 'You must be subscribed to access this resource' },
                { status: 401 }
            );
        }

        // Initialize Redis client
        const redis = Redis.fromEnv();

        // Rate limiting - 100 requests per day per user
        const rateLimitKey = `rate_limit:${dbUser.id}`;

        try {
            // Use pipeline for atomic operations
            const pipeline = redis.pipeline();
            pipeline.incr(rateLimitKey);
            pipeline.expire(rateLimitKey, 86400, 'NX'); // Only set expire if key doesn't have one
            const results = await pipeline.exec();

            const current = results?.[0] as number || 1; // Default to 1 if results unavailable

            if (current > 100) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded', details: 'Too many requests' },
                    { status: 429 }
                );
            }
        } catch (error) {
            console.error('Redis error:', error);
            // Allow request to proceed if Redis fails
        }

        // リクエストボディを取得してバリデーション
        const rawBody = await req.json();
        const validationResult = conversationRequestSchema.safeParse(rawBody);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const body: ConversationRequest = validationResult.data;

        const number = 2;
        const translationLanguage = body.translationLanguage;
        const needsTranslation: boolean = !!(translationLanguage && translationLanguage !== '');
        const context = body.context || '';

        // utteranceHistoryから最新の発言と過去の文脈を取得
        const recentInput = body.utteranceHistory.at(-1) || '';
        const olderContext = body.utteranceHistory.slice(0, -1).join(' ');

        console.log('Recent input:', recentInput);
        console.log('Older context:', olderContext || '[No older context available]');

        // ユーザーのロケールを取得して言語として使用
        // Next.js headers()からAccept-Languageを取得するか、リクエストのlocaleパラメータを使用
        const userLocale = body.locale || defaultLocale;

        // サポートされているロケールかチェック
        const isValidLocale = (locale: string): locale is Locale =>
            locales.includes(locale as Locale);

        const detectedLanguage = isValidLocale(userLocale)
            ? userLocale
            : defaultLocale;

        console.log('Using user locale for language detection:', detectedLanguage);

        // 具体的な内容を含むサジェスト生成プロンプトを作成
        const prompt = generateSubstantivePrompt(
            recentInput,
            olderContext,
            detectedLanguage,
            translationLanguage,
            needsTranslation,
            number,
            context
        );

        // サジェストを生成
        const result = await streamObject({
            model,
            prompt: prompt,
            schema: conversationSuggestionSchema,
            mode: 'json',
            experimental_telemetry: AISDKExporter.getSettings()
        });

        const response = result.toTextStreamResponse();

        // Schedule usage tracking to run after response is sent
        after(async () => {
            try {
                await db.apiUsage.create({
                    data: {
                        userId: dbUser.id,
                        locale: body.locale || defaultLocale,
                        translationLanguage: body.translationLanguage,
                        inputLength: body.utteranceHistory.reduce((sum: number, utterance: string) => sum + utterance.length, 0),
                        recentInputLength: body.utteranceHistory.length > 0
                            ? body.utteranceHistory[body.utteranceHistory.length - 1].length
                            : 0,
                        contextLength: body.context?.length
                    }
                });
            } catch (error) {
                console.error('Error tracking API usage:', error);
            }
        });

        return response;
    } catch (error) {
        console.error('Error processing request:', error);
        return new Response(JSON.stringify({ error: 'Failed to process request' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
