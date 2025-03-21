import { z } from 'zod';

// リクエストスキーマの定義
export const conversationRequestSchema = z.object({
    message: z.string(),
    context: z.string().nullish(),
    translationLanguage: z.string().nullish(),
});

// レスポンススキーマ（すでに持っているものを再利用）
export const conversationSuggestionSchema = z.object({
    suggestions: z.array(
        z.object({
            category: z.string().describe('Suggestion category'),
            content: z.string().describe('Content of the suggestion for the user to say next'),
            translation: z.string().optional().describe('Translation of the suggestion'),
            confidenceLevel: z.number().min(1).max(100).describe('Confidence level of this suggestion (1-100)'),
            reasonForSuggestion: z.string().describe('Why this suggestion is appropriate based on what the user has already said'),
        }),
    ),
});

// 型のエクスポート
export type ConversationRequest = z.infer<typeof conversationRequestSchema>;
export type ConversationSuggestion = z.infer<typeof conversationSuggestionSchema>;