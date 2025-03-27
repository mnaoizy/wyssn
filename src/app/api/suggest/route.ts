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

// 直近の発言を抽出する関数
/**
 * 日本語に特化した直近の発言抽出関数
 * 日本語の文章構造に合わせて最適化されています
 */
function extractRecentInput(fullInput: string): { recentInput: string, olderContext: string } {
    console.log('Full input length:', fullInput.length);

    // 1. 日本語の句読点を含む区切り文字で分割
    // 「。」「！」「？」で終わる文の後にスペースがなくても分割できるようにする
    const japanesePattern = /([。！？\.\!?]+\s*)/;
    const segments = fullInput.split(japanesePattern).filter(Boolean);

    // セグメントを結合して完全な文を形成（区切り文字を含む）
    const sentences = [];
    for (let i = 0; i < segments.length; i += 2) {
        const content = segments[i];
        const punctuation = segments[i + 1] || "";
        sentences.push(content + punctuation);

    }

    console.log('Japanese sentences count:', sentences.length);

    // 文が十分に分割できた場合
    if (sentences.length > 1) {
        // 最新の2〜3文を「最近の発言」として扱う（日本語は短い文が多いため）
        const recentSentenceCount = Math.min(Math.max(1, Math.ceil(sentences.length / 3)), 3);
        const recentInput = sentences.slice(-recentSentenceCount).join('').trim();
        const olderContext = sentences.slice(0, -recentSentenceCount).join('').trim();

        console.log('Using Japanese sentence-based segmentation');
        console.log('Recent sentence count:', recentSentenceCount);
        return { recentInput, olderContext };
    }

    // 2. 文が分割できない場合、「です」「ます」などの文末表現で分割を試みる
    const japaneseEndingPattern = /((です|ます|である|だ|のだ)(が|けど|から|ね|よ|わ)?(\s|$))/;
    const endingSegments = fullInput.split(japaneseEndingPattern).filter(Boolean);

    // 文末表現で十分に分割できた場合
    if (endingSegments.length >= 4) { // 少なくとも2つの文が形成できる場合
        console.log('Using Japanese verb-ending based segmentation');

        // セグメントを結合して文を形成
        const verbalSentences = [];
        for (let i = 0; i < endingSegments.length; i += 3) {
            if (endingSegments[i]) {
                const content = endingSegments[i];
                const ending = (endingSegments[i + 1] || "") + (endingSegments[i + 2] || "");
                verbalSentences.push(content + ending);
            }
        }

        console.log('Verbal sentences count:', verbalSentences.length);

        // 最新の文を「最近の発言」として扱う
        const recentVerbCount = Math.min(2, verbalSentences.length);
        const recentInput = verbalSentences.slice(-recentVerbCount).join('').trim();
        const olderContext = verbalSentences.slice(0, -recentVerbCount).join('').trim();

        return { recentInput, olderContext };
    }

    // 3. 上記の方法で分割できない場合、形態素解析的なアプローチで単語区切りを試みる
    // 単純化のため、空白やよく使われる助詞で分割
    const words = fullInput.split(/[\s、,　・「」『』()（）\[\]【】]/g).filter(w => w.length > 0);
    console.log('Japanese word segments:', words.length);

    // 入力が短い場合は全体を最近の入力として扱う
    if (words.length <= 10 || fullInput.length < 100) {
        console.log('Input is short, using entire text as recent input');
        return { recentInput: fullInput, olderContext: "" };
    }

    // 長い入力の場合、後半1/3を「最近の入力」として扱う
    const wordThreshold = Math.max(15, Math.floor(words.length / 3));
    console.log('Using Japanese word-based segmentation');
    console.log('Recent word threshold:', wordThreshold);

    // 単語数ではなく、文字数に基づいて分割
    const chars = fullInput.split('');
    const charThreshold = Math.floor(chars.length * 0.4); // 後半40%を最近の入力とする

    const recentInput = fullInput.slice(-charThreshold);
    const olderContext = fullInput.slice(0, -charThreshold);

    return { recentInput, olderContext };
}

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

        // 検証済みのデータからユーザー入力を取得
        const userInput = body.message;
        const number = 2;
        const translationLanguage = body.translationLanguage;
        const needsTranslation: boolean = !!(translationLanguage && translationLanguage !== '');
        const context = body.context || '';

        // 直近の発言と過去の文脈を分離
        const { recentInput, olderContext } = extractRecentInput(userInput);
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
                        inputLength: body.message.length,
                        recentInputLength: extractRecentInput(body.message).recentInput.length,
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
