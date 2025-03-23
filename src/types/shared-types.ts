import { z } from 'zod';

// リクエストスキーマの定義
export const conversationRequestSchema = z.object({
    message: z.string(),
    context: z.string().nullish(),
    translationLanguage: z.string().nullish(),
    locale: z.string().nullish(),
    detailLevel: z.enum(['brief', 'standard', 'detailed']).optional(), // 追加

});

// レスポンススキーマ（すでに持っているものを再利用）
export const conversationSuggestionSchema = z.object({
    suggestions: z.array(
        z.object({
            content: z.string().describe('Content of the suggestion for the user to say next'),
            translation: z.string().optional().describe('Translation of the suggestion'),

        }),
    ),
});

// 型のエクスポート
export type ConversationRequest = z.infer<typeof conversationRequestSchema>;
export type ConversationSuggestion = z.infer<typeof conversationSuggestionSchema>;
