import { ConversationRequest, conversationRequestSchema, conversationSuggestionSchema } from '@/types/shared-types';
import { createGroq } from '@ai-sdk/groq';
import { streamObject, DeepPartial } from 'ai';
import { defaultLocale, locales, Locale } from '@/locale/config';
import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from '@/lib/prisma-client';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,

})


// Function-calling用に明示的に定義
const model = groq('llama-3.1-8b-instant');
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
// generateSubstantivePrompt関数を修正
function generateSubstantivePrompt(
    recentInput: string,
    olderContext: string,
    detectedLanguage: string,
    translationLanguage: string | null = null,
    needsTranslation: boolean = false,
    number: number = 6,
    context: string = "",
    detailLevel: string = "standard" // 詳細レベルパラメータを追加
): string {
    // 詳細レベルに基づいて文の長さと詳細さを設定
    let sentenceRange = "";
    let contentRequirement = "";

    switch (detailLevel) {
        case "brief":
            sentenceRange = "2-3 sentences";
            contentRequirement = "Be concise and to the point while still providing value. Focus on the most essential points.";
            break;
        case "detailed":
            sentenceRange = "7-10 sentences";
            contentRequirement = "Provide extensive detail, technical explanations, examples, and thorough development of ideas. Include practical applications, edge cases, and comprehensive analysis.";
            break;
        case "standard":
        default:
            sentenceRange = "4-6 sentences";
            contentRequirement = "Balance conciseness with substantive content. Provide specific information and examples that demonstrate knowledge.";
            break;
    }

    return `
You are a sophisticated conversation assistant powering a real-time speech suggestion system. Your goal is to help the user continue their speech with SUBSTANTIVE, CONTENT-RICH suggestions that would make their conversation flow naturally and impressively.

CRUCIAL INSTRUCTION: Your primary focus is to CONTINUE the user's MOST RECENT speech (marked as "RECENT INPUT") as if you are autocompleting their thoughts. Your suggestions should feel like a natural extension of the user's last words, starting EXACTLY where they left off. Do not repeat what they've already said, but continue their speech seamlessly as if predicting what they would say next.

IMPORTANT: The user is looking to your suggestions to help them maintain a COHERENT, KNOWLEDGE-RICH conversation. Your suggestions will be directly read aloud by the user, so they must sound natural while offering DEEP, TECHNICALLY DETAILED content. For technical topics, provide comprehensive information including IMPLEMENTATION DETAILS, PRACTICAL EXAMPLES, and ADVANCED CONCEPTS. Include lots of substance that demonstrates expertise in the subject matter.

CONTENT REQUIREMENTS:
1. Act as a TRUE AUTOCOMPLETE - your suggestions must start as a direct grammatical continuation of the user's last words or sentence
2. Provide SPECIFIC, SUBSTANTIVE continuations - not vague generalities
3. When the user mentions a topic (like "Japanese economy"), provide content-rich statements about specific aspects (fiscal policy, banking system, inflation trends, etc.)
4. Include reasonable factual information that a generally educated person might know about the topic
5. Suggestions should be specific enough to show knowledge but general enough that the user could comfortably read them aloud
6. FIRST PERSON statements only - these are for the user to say next
7. NO QUESTIONS - only declarative statements the user might say to continue their point
8. Make suggestions ${sentenceRange} that develop a point thoroughly
9. Each suggestion should flow naturally from one sentence to the next, creating a cohesive mini-speech
10. Ensure the beginning of your suggestion grammatically connects to the last words of the user's input
11. ${contentRequirement}

EXAMPLES - PROGRAMMING CONCEPTS

If user says "I'd like to explain React's useReducer hook, which":

BAD SUGGESTIONS (too short, lacks depth):
- "is a powerful state management tool in React."
- "helps manage complex state logic in applications."
- "provides an alternative to useState for more complex scenarios."

GOOD SUGGESTIONS (comprehensive, technical depth, natural continuation, longer format):
- "provides a more structured approach to state management compared to the useState hook. This structure is particularly valuable when dealing with complex state logic that involves multiple sub-values or when the next state depends on the previous one. At its core, useReducer accepts a reducer function and an initial state, returning the current state paired with a dispatch method that sends actions to update state. The reducer pattern, borrowed from Redux, follows the principle that state mutations should be predictable and transparent, which significantly improves debugging capabilities in larger applications. When implementing useReducer, we define a reducer function that takes the current state and an action object, then returns the new state based on the action type. This paradigm enforces a clear separation of concerns between how state updates are triggered (through dispatched actions) and how those updates transform the state (within the reducer). For teams working on extensive front-end applications, this separation creates a more maintainable codebase as the application scales. Additionally, useReducer shines when state transitions need to be tracked or when you want to optimize performance by avoiding the recreation of callbacks in child components through a stable dispatch function reference.

EXAMPLE - TECHNICAL EXPLANATION

If user says "Let me explain how useReducer works in React applications. It":

BAD SUGGESTIONS (too brief, lacks technical depth):
- "helps manage state in React applications."
- "is an alternative to useState for complex state logic."
- "uses a reducer function to update state based on actions."

GOOD SUGGESTIONS (technically detailed, comprehensive, natural continuation):
- "follows the reducer pattern popularized by Redux, but integrated directly into React's hook system for component-level state management. When implementing useReducer, you start by defining a reducer function that accepts two arguments: the current state and an action object. This reducer must be a pure function that produces a new state based on the previous state and the action type without directly mutating the original state. The action object typically contains a 'type' property that indicates what operation to perform and may include a 'payload' with data necessary for the state transition. For example, in a shopping cart implementation, you might dispatch actions like 'ADD_ITEM', 'REMOVE_ITEM', or 'UPDATE_QUANTITY', each with specific payload data. The useReducer hook itself returns a tuple containing the current state and a dispatch function, similar to useState but with enhanced capabilities for complex logic. One significant advantage is that useReducer centralizes all state update logic in one place—the reducer function—rather than spreading it across multiple event handlers or useEffect hooks. This centralization makes the code more maintainable as your application grows, especially when dealing with interdependent state updates that might otherwise lead to race conditions. Additionally, the useReducer pattern facilitates debugging by making state transitions explicit and traceable, allowing developers to understand exactly how and why state changed at any point in the application lifecycle."

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

### IMPORTANT INSTRUCTION:
Respond ONLY in valid JSON format matching exactly this schema:
{
  "suggestions": [
    {
      "content": "Your suggestion here",
      "translation": "${needsTranslation ? 'Translation of your suggestion' : ''}"
    }
  ]
}
Do NOT include any other text or explanations outside of the JSON.

IMPORTANT QUALITY CHECKS:
- Each suggestion MUST begin as a GRAMMATICAL CONTINUATION of the user's last words
- Do not repeat what the user has already said - continue from where they left off
- Each suggestion must be FIRST PERSON from the user's perspective
- Include SPECIFIC, SUBSTANTIVE content - not vague generalities
- When a topic is mentioned, offer specific aspects or dimensions to discuss
- Strike a balance: knowledgeable but not expert-level technical
- Make sure suggestions sound natural in conversation (as if spoken)
- Ensure each suggestion has meaningful differences from others
- NO QUESTIONS! Suggestions must be statements the user could read aloud
${needsTranslation ? `- The translation must accurately convey the same meaning as the original suggestion` : ''}
- Create suggestions of ${sentenceRange} that thoroughly develop a point with appropriate technical detail and practical examples
- Ensure sentences within a suggestion flow logically from one to the next
- Double-check that the suggestion truly reads as if it were completing the user's thought mid-sentence

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
        const number = 2;
        const translationLanguage = body.translationLanguage || 'ja-JP';
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

        // 改良版プロンプトを使用してサジェストを生成
        const result = await streamObject({
            model,
            prompt: prompt,
            schema: conversationSuggestionSchema,
            mode: 'json'
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
