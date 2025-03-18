import { openai } from '@ai-sdk/openai';
import { streamObject, DeepPartial, generateText } from 'ai';
import { z } from 'zod';

// 会話提案のスキーマを定義
export const conversationSuggestionSchema = z.object({
    suggestions: z.array(
        z.object({
            id: z.string().describe('Unique identifier for this suggestion'),
            category: z.string().describe('Suggestion category'),
            content: z.string().describe('Content of the suggestion for the user to say next'),
            translation: z.string().optional().describe('Translation of the suggestion'),
            confidenceLevel: z.number().min(1).max(100).describe('Confidence level of this suggestion (1-100)'),
            reasonForSuggestion: z.string().describe('Why this suggestion is appropriate based on what the user has already said'),
        }),
    ),
})

// 生成中の部分的なデータ型
export type PartialConversationSuggestion = DeepPartial<typeof conversationSuggestionSchema>

// 最大30秒のストリーミングレスポンスを許可
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // messagesからユーザー入力を取得するか、リクエストボディに直接ユーザー入力がある場合はそれを使用
        let userInput = '';

        if (typeof body === 'string') {
            userInput = body;
        } else if (body.messages && Array.isArray(body.messages)) {
            userInput = body.messages[0] || '';
        } else if (body.message) {
            userInput = body.message;
        } else {
            // テスト用のデフォルト入力
            userInput = '最近、久しぶりにパズルにハマっています。特に1000ピースくらいの風景画を少しずつ組み立てていくのが、なんだか日々のストレス解消になっていて。集中していると時間があっという間に過ぎるんですよね。みなさんは、何か日常のリフレッシュ方法とかありますか？単純なことでも意外と効果あったりしますよね。';
        }

        const number = 6;
        const translationLanguage = body.translationLanguage || 'ja-JP';
        const needsTranslation = translationLanguage && translationLanguage !== '';

        // 入力言語を検出する（非ストリーミング）
        const { text: detectedLanguage } = await generateText({
            model: openai('gpt-4o-mini'),
            prompt: `
Detect the language of the following text and return only the ISO language code (e.g., "en", "ja", "fr", "es", "zh", etc.):

"${userInput}"

Return ONLY the language code without any additional text or explanation.
`,
        });

        // 英語のプロンプトを使用し、言語情報を渡す
        const result = await streamObject({
            model: openai('gpt-4o-mini'),
            prompt: `
You are a conversation assistant. Based on what the user has just said, suggest ${number} ways they could continue speaking that would naturally extend the conversation.

IMPORTANT INSTRUCTIONS:
1. These suggestions are for "what the user should say next", NOT responses from the other person.
2. NEVER invent facts, experiences, or events that were not mentioned by the user. Only suggest continuations based on information they've explicitly shared.
3. DO NOT repeat what the user has already said with minor modifications.
4. Suggestions should be authentically in the user's voice and perspective.
5. Focus on the user elaborating on thoughts they've already introduced.

For example, if the user says "I like puzzles", suggesting "What kind of puzzles do you like?" would be INCORRECT because that's a question someone else would ask the user.

Instead, suggest something like "I find that puzzle-solving helps me clear my mind after a long day at work" - something that extends their thought without introducing fictional experiences.

BAD EXAMPLE (inventing facts): "Last week I completed a 5000-piece puzzle of Mount Fuji" (unless they mentioned this)
BAD EXAMPLE (just repeating): "Yes, I really enjoy puzzles a lot, they're so fun"
GOOD EXAMPLE: "I'm thinking of trying wooden puzzles next since they seem to have more interesting piece shapes"

The user's input is in this language: ${detectedLanguage}
Your suggestions MUST be in this SAME language.

${needsTranslation ? `You should also provide a translation of each suggestion in ${translationLanguage} language.` : 'Do not provide translations.'}

User's previous statement:
${userInput}

For each suggestion, include:
- ID (Short random ID like "dBvJIh7H")
- Category (choose one: 感想の深掘り, 詳細の補足, 質問の展開, 関連話題への展開, 個人的感想)
- Content (natural statement the user could say next)
${needsTranslation ? `- Translation (accurate translation of the content in ${translationLanguage})` : ''}
- Confidence level (how appropriate this suggestion is, 1-100)
- reasonForSuggestion (explain why this suggestion is grounded in what the user has actually said)

IMPORTANT QUALITY CHECKS:
- Each suggestion must pass the "truth test": Would the user ACTUALLY know this information about themselves?
- Avoid generic statements that could apply to anyone
- Do not invent specific experiences, facts, or details
- Make sure suggestions sound natural in conversation
- Ensure each suggestion has meaningful differences from others
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