import { ConversationRequest, conversationRequestSchema, conversationSuggestionSchema } from '@/types/shared-types';
import { google } from '@ai-sdk/google';
import { streamObject, DeepPartial, generateText } from 'ai';
import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";



// 生成中の部分的なデータ型
export type PartialConversationSuggestion = DeepPartial<typeof conversationSuggestionSchema>

// 最大30秒のストリーミングレスポンスを許可
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { isAuthenticated: checkAuthentication } = getKindeServerSession();

        const isAuthenticated = await checkAuthentication();

        if (!isAuthenticated) {
            return NextResponse.json(
                { error: 'Unauthorized', details: 'You must be logged in to access this resource' },
                { status: 401 }
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

        // 検証済みのデータからユーザー入力を取得
        const userInput = body.message;
        const number = 6;
        const translationLanguage = body.translationLanguage || 'ja-JP';
        const needsTranslation = translationLanguage && translationLanguage !== '';

        // 入力言語を検出する（非ストリーミング）
        const { text: detectedLanguage } = await generateText({
            model: google('gemini-2.0-flash-lite-preview-02-05'),
            prompt: `
Detect the language of the following text and return only the ISO language code (e.g., "en-US", "ja-JP", "fr-FR", "zh-CN", etc.):

"${userInput}"

Return ONLY the language code without any additional text or explanation.
`,
        });

        // 英語のプロンプトを使用し、言語情報を渡す
        // 元のコードから該当部分だけを抜粋し、プロンプト文を改善

        // 英語のプロンプトを使用し、言語情報を渡す
        const result = await streamObject({
            model: google('gemini-2.0-flash-lite-preview-02-05'),
            prompt: `
You are a conversation assistant. Based on what the user has just said, suggest ${number} ways they could continue speaking that would naturally extend the conversation.

IMPORTANT INSTRUCTIONS:
1. These suggestions MUST be statements or narratives FROM THE USER'S PERSPECTIVE that they could say next, NOT questions they would ask someone else.
2. ABSOLUTELY DO NOT invent facts, experiences, details, or events. Only suggest very general continuations based on information they've explicitly shared.
3. DO NOT repeat what the user has already said with minor modifications.
4. Suggestions should be authentically in the user's voice and perspective.
5. Focus on how the user could elaborate on their own thoughts, experiences, or opinions they've already introduced, WITHOUT adding specific details that weren't mentioned.
6. AVOID GENERATING QUESTIONS. Generate first-person statements that continue the user's narrative.
7. When unsure about specific details, use vague, general statements that avoid making assumptions.

EXAMPLES OF GOOD SUGGESTIONS:
If the user says "I like puzzles", do NOT suggest:
- "I especially enjoy crossword puzzles because they challenge my vocabulary" (assumes specific preference)
- "I started doing puzzles when I was a child, and it became a lifelong hobby" (assumes timeline)
- "Recently I completed a 1000-piece landscape puzzle that took me two weeks" (invents specific event)

Instead, suggest:
- "I find puzzles to be a relaxing way to spend my free time"
- "There's something satisfying about solving puzzles step by step"
- "I like the different types of mental challenges that puzzles can offer"

If the user says "I was born in Japan and raised there all my life":
BAD EXAMPLES (inventing facts not mentioned):
- "I grew up in the Kansai region, specifically in Osaka" (invents specific location)
- "My school years in Japan were quite structured, with lots of emphasis on studying" (assumes specific experience)
- "Even though I was raised in Japan, I also traveled abroad occasionally with my family" (invents travel history)

GOOD EXAMPLES (general statements without inventing specifics):
- "Living in Japan my entire life has shaped how I see the world"
- "I could share more about what it was like growing up in Japan if you're interested"
- "The experience of growing up in Japan gave me a perspective that I appreciate"
- "There are many aspects of Japanese culture that have influenced me throughout my life"
- "I have many memories from different stages of my life in Japan"

The user's input is in this language: ${detectedLanguage}
Your suggestions MUST be in this SAME language.

${needsTranslation ? `You should also provide a translation of each suggestion in ${translationLanguage} language.` : 'Do not provide translations.'}

User's previous statement:
${userInput}

For each suggestion, include:
- Category (choose one: "deeper_reflection", "additional_context", "narrative_continuation", "related_thoughts", "personal_perspective")
- Content (natural first-person statement the user could say next WITHOUT inventing specific details)
${needsTranslation ? `- Translation (accurate translation of the content in ${translationLanguage})` : ''}
- Confidence level (how appropriate this suggestion is, 1-100)
- reasonForSuggestion (explain why this suggestion is grounded in what the user has actually said without adding fictional elements)

IMPORTANT QUALITY CHECKS:
- Each suggestion must be in FIRST PERSON from the user's perspective
- ZERO invented details: Do not create specific facts, locations, timelines, or experiences
- Each suggestion should be general enough that it doesn't require knowledge the user hasn't shared
- Vagueness is preferred over false specificity
- Avoid generic statements that could apply to anyone
- Make sure suggestions sound natural in conversation
- Ensure each suggestion has meaningful differences from others
- NO QUESTIONS! Suggestions should be statements that continue the user's narrative
${needsTranslation ? `- The translation must accurately convey the same meaning as the original suggestion` : ''}

Remember to provide ALL responses in the SAME LANGUAGE as the user's input (${detectedLanguage}) ${needsTranslation ? `with translations in ${translationLanguage}` : ''}.
`,
            schema: conversationSuggestionSchema,
        });

        return result.toTextStreamResponse();
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