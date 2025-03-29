import { ConversationRequest, conversationRequestSchema, conversationSuggestionSchema } from '@/types/shared-types';
import { google } from '@ai-sdk/google';
import { streamObject, DeepPartial } from 'ai';
import { defaultLocale, locales, Locale } from '@/locale/config';
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { AISDKExporter } from 'langsmith/vercel';
import { generateSubstantivePrompt } from '../suggest/lib/prompts';
import { createRequestLogger } from '@/lib/logger';


// Function-calling用に明示的に定義
const model = google("gemini-2.0-flash-lite-preview-02-05")
// 生成中の部分的なデータ型
export type PartialConversationSuggestion = DeepPartial<typeof conversationSuggestionSchema>

// 最大60秒のストリーミングレスポンスを許可
export const maxDuration = 60;


export async function POST(req: Request) {
    // Get client IP from headers
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    try {
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
            const logger = createRequestLogger(ip || 'unknown');
            logger.warn({
                message: "Rate limit exceeded for free tier",
                ipPartial: ip ? `${ip.substring(0, 3)}...${ip.substring(ip.length - 3)}` : 'unknown',
                limit: 20
            });
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: 'Daily limit reached. Create a free account for more access.' },
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

        // ユーザーのロケールを取得して言語として使用
        // Next.js headers()からAccept-Languageを取得するか、リクエストのlocaleパラメータを使用
        const userLocale = body.locale || defaultLocale;

        // サポートされているロケールかチェック
        const isValidLocale = (locale: string): locale is Locale =>
            locales.includes(locale as Locale);

        const detectedLanguage = isValidLocale(userLocale)
            ? userLocale
            : defaultLocale;

        const logger = createRequestLogger(ip || 'unknown');
        logger.info({
            message: "User input received",
            inputSummary: {
                recentInputLength: recentInput.length,
                olderContextLength: olderContext.length,
                detectedLanguage,
                needsTranslation,
                contextLength: context.length
            },
            ipPartial: ip ? `${ip.substring(0, 3)}...${ip.substring(ip.length - 3)}` : 'unknown',
            path: req.url
        });

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
        const logger = createRequestLogger(ip || 'unknown');
        logger.error({
            message: "Error processing request",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            ipPartial: ip ? `${ip.substring(0, 3)}...${ip.substring(ip.length - 3)}` : 'unknown',
            path: req.url
        });
        return new Response(JSON.stringify({ error: 'Failed to process request' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
