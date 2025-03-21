import { ConversationRequest, conversationRequestSchema, conversationSuggestionSchema } from '@/types/shared-types';
import { google } from '@ai-sdk/google';
import { streamObject, DeepPartial, generateText } from 'ai';
import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from '@/lib/prisma-client';

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

// 具体的な内容を含むサジェスト生成プロンプトを作成する関数
function generateSubstantivePrompt(
    recentInput: string,
    olderContext: string,
    detectedLanguage: string,
    translationLanguage: string | null = null,
    needsTranslation: boolean = false,
    number: number = 6,
    context: string = ""
): string {
    return `
You are a sophisticated conversation assistant powering a real-time speech suggestion system. Your goal is to help the user continue their speech with SUBSTANTIVE, CONTENT-RICH suggestions that would make their conversation flow naturally and impressively.

CRUCIAL INSTRUCTION: Your primary focus is the user's MOST RECENT speech (marked as "RECENT INPUT"). Generate suggestions that continue DIRECTLY from this point with SPECIFIC, SUBSTANTIVE content.

IMPORTANT: The user is looking to your suggestions to help them maintain a COHERENT, KNOWLEDGE-RICH conversation. Your suggestions will be directly read aloud by the user, so they must sound natural while offering substantive content.

CONTENT REQUIREMENTS:
1. Provide SPECIFIC, SUBSTANTIVE continuations - not vague generalities
2. When the user mentions a topic (like "Japanese economy"), provide content-rich statements about specific aspects (fiscal policy, banking system, inflation trends, etc.)
3. Include reasonable factual information that a generally educated person might know about the topic
4. Suggestions should be specific enough to show knowledge but general enough that the user could comfortably read them aloud
5. FIRST PERSON statements only - these are for the user to say next
6. NO QUESTIONS - only declarative statements the user might say to continue their point
7. Keep suggestions concise (1-2 sentences) but information-dense

EXAMPLES - TOPIC: JAPANESE ECONOMY

If user says "I'd like to discuss the Japanese economy":

BAD SUGGESTIONS (too vague, lacks substance):
- "I want to share my thoughts about the Japanese economy and its various aspects."
- "The Japanese economy has many interesting features that are worth exploring further."
- "I think the Japanese economy has both strengths and challenges which are important to consider."

GOOD SUGGESTIONS (specific, substantive, but not overly technical):
- "I'd like to start by examining Japan's public debt situation, which at over 250% of GDP is the highest among developed nations."
- "The Bank of Japan's negative interest rate policy has created a unique monetary environment that's worth analyzing in detail."
- "Japan's aging population has created significant economic challenges, particularly for their pension system and labor market."
- "The concept of lifetime employment, though less common now, has been a distinctive feature of Japan's corporate culture and economy."

EXAMPLES - TOPIC: CLIMATE CHANGE

If user says "I want to talk about climate change":

BAD SUGGESTIONS (too generic, lacks substance):
- "Climate change is a very important issue that affects us all in various ways."
- "There are many aspects of climate change that we could discuss further."
- "I believe climate change requires our attention and has many different dimensions."

GOOD SUGGESTIONS (specific, substantive):
- "The IPCC's latest report indicates we need to limit warming to 1.5 degrees Celsius to avoid the most severe climate impacts."
- "Carbon pricing mechanisms, whether through taxes or cap-and-trade systems, represent one market-based approach to emissions reduction."
- "The transition to renewable energy sources like solar and wind has accelerated significantly, with costs dropping over 80% in the past decade."
- "Ocean acidification, a direct result of increased carbon dioxide absorption, poses a serious threat to marine ecosystems, particularly coral reefs."

The user's input is in this language: ${detectedLanguage}
Your suggestions MUST be in this SAME language.

${needsTranslation ? `You should also provide a translation of each suggestion in ${translationLanguage} language.` : 'Do not provide translations.'}

${context ? `CONVERSATION CONTEXT: ${context}` : ''}

EARLIER CONTEXT (consider this for background only):
${olderContext || '[No earlier context available]'}

RECENT INPUT (primary focus for suggestions):
${recentInput}

For each suggestion, include ONLY:
- Content (substantive first-person statement the user could say next that contains SPECIFIC information)
${needsTranslation ? `- Translation (accurate translation of the content in ${translationLanguage})` : ''}

IMPORTANT QUALITY CHECKS:
- Each suggestion must be FIRST PERSON from the user's perspective
- Include SPECIFIC, SUBSTANTIVE content - not vague generalities
- When a topic is mentioned, offer specific aspects or dimensions to discuss
- Strike a balance: knowledgeable but not expert-level technical
- Make sure suggestions sound natural in conversation (as if spoken)
- Ensure each suggestion has meaningful differences from others
- NO QUESTIONS! Suggestions must be statements the user could read aloud
${needsTranslation ? `- The translation must accurately convey the same meaning as the original suggestion` : ''}
- Keep suggestions concise (1-2 sentences) but information-rich

Provide EXACTLY ${number} suggestions with ONLY the content and ${needsTranslation ? 'translation' : ''} fields - no other fields.

Remember to provide ALL responses in the SAME LANGUAGE as the user's input (${detectedLanguage}) ${needsTranslation ? `with translations in ${translationLanguage}` : ''}.
`;
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

        // サブスクリプション確認
        const dbUser = await db.user.findUnique({
            where: { kindeId: user.id },
            select: {
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

        const subscribed = dbUser.subscriptions.some(
            subscription => ['active', 'trialing'].includes(subscription.status)
        );

        if (!subscribed) {
            return NextResponse.json(
                { error: 'Unauthorized', details: 'You must be subscribed to access this resource' },
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
        const number = 3;
        const translationLanguage = body.translationLanguage || 'ja-JP';
        const needsTranslation: boolean = !!(translationLanguage && translationLanguage !== '');
        const context = body.context || '';

        // 直近の発言と過去の文脈を分離
        const { recentInput, olderContext } = extractRecentInput(userInput);
        console.log('Recent input:', recentInput);
        console.log('Older context:', olderContext || '[No older context available]');

        // 入力言語を検出する（非ストリーミング）
        const { text: detectedLanguage } = await generateText({
            model: google('gemini-2.0-flash-lite-preview-02-05'),
            prompt: `
Detect the language of the following text and return only the ISO language code (e.g., "en-US", "ja-JP", "fr-FR", "zh-CN", etc.):

"${recentInput}"

Return ONLY the language code without any additional text or explanation.
`,
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

        // 改良版プロンプトを使用してサジェストを生成
        const result = await streamObject({
            model: google('gemini-2.0-flash-lite-preview-02-05'),
            prompt: prompt,
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