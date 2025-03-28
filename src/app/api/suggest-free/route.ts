import { ConversationRequest, conversationRequestSchema, conversationSuggestionSchema } from '@/types/shared-types';
import { google } from '@ai-sdk/google';
import { streamObject, DeepPartial } from 'ai';
import { defaultLocale, locales, Locale } from '@/locale/config';
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { AISDKExporter } from 'langsmith/vercel';
import { generateSubstantivePrompt } from '../suggest/lib/prompts';


// Function-calling用に明示的に定義
const model = google("gemini-2.0-flash-lite-preview-02-05")
// 生成中の部分的なデータ型
export type PartialConversationSuggestion = DeepPartial<typeof conversationSuggestionSchema>

// 最大60秒のストリーミングレスポンスを許可
export const maxDuration = 60;


export async function POST(req: Request) {
    try {


        // Get client IP from headers
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
        if (!ip) {
            return NextResponse.json(
                { error: 'Bad Request', details: 'Could not determine client IP' },
                { status: 400 }
            );
        }

        // Rate limiting - 20 requests per day per IP
        const ratelimit = new Ratelimit({
            redis: Redis.fromEnv(),
            limiter: Ratelimit.slidingWindow(20, '1 d'),
        });

        const { success } = await ratelimit.limit(`ip_${ip}`);

        if (!success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: 'Too many requests (max 100 per day)' },
                { status: 429 }
            );
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
