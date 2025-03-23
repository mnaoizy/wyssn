'use client';

import { useReducer } from 'react';
import { SUPPORTED_LOCALES, defaultLocale, Locale } from '@/locale/config';
import { conversationSuggestionSchema } from '@/types/shared-types';
import { Button } from '@/components/ui/button';
import { experimental_useObject as useObject } from '@ai-sdk/react';

// Define the type for suggestions from the AI SDK
type SuggestionObject = {
    suggestions?: Array<{
        content?: string;
        translation?: string;
    } | undefined>;
};

// Define state types
type State = {
    message: string;
    context: string;
    translationLanguage: string;
    locale: Locale;
    previousSuggestions: SuggestionObject | null;
};

// Define action types
type Action =
    | { type: 'SET_MESSAGE'; payload: string }
    | { type: 'SET_CONTEXT'; payload: string }
    | { type: 'SET_TRANSLATION_LANGUAGE'; payload: string }
    | { type: 'SET_LOCALE'; payload: Locale }
    | { type: 'SET_PREVIOUS_SUGGESTIONS'; payload: SuggestionObject | null };

// Define reducer function
const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'SET_MESSAGE':
            return { ...state, message: action.payload };
        case 'SET_CONTEXT':
            return { ...state, context: action.payload };
        case 'SET_TRANSLATION_LANGUAGE':
            return { ...state, translationLanguage: action.payload };
        case 'SET_LOCALE':
            return { ...state, locale: action.payload };
        case 'SET_PREVIOUS_SUGGESTIONS':
            return { ...state, previousSuggestions: action.payload };
        default:
            return state;
    }
};

export default function TestSuggestPage() {
    // Initial state
    const initialState: State = {
        message: '',
        context: '',
        translationLanguage: '',
        locale: defaultLocale,
        previousSuggestions: null,
    };

    // Use reducer instead of multiple useState hooks
    const [state, dispatch] = useReducer(reducer, initialState);
    const { message, context, translationLanguage, locale, previousSuggestions } = state;

    // Use useObject hook to interact with the suggest API
    const {
        submit,
        isLoading,
        object: suggestions,
        error: suggestError,
    } = useObject({
        api: '/api/suggest',
        schema: conversationSuggestionSchema,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 現在の提案を保存
        if (suggestions) {
            dispatch({ type: 'SET_PREVIOUS_SUGGESTIONS', payload: suggestions });
        }

        // Submit to the suggestion API using the useObject hook
        await submit({
            message,
            context: context || undefined,
            translationLanguage: translationLanguage || undefined,
            locale,
        });
    };

    // 表示するサジェスト結果の決定
    const displaySuggestions = suggestions || (isLoading ? previousSuggestions : null);

    return (
        <div className="container max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Suggestion API Test</h1>

            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">
                        Message (required)
                    </label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => dispatch({ type: 'SET_MESSAGE', payload: e.target.value })}
                        rows={4}
                        className="w-full p-2 border rounded-md"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="context" className="block text-sm font-medium mb-1">
                        Context (optional)
                    </label>
                    <textarea
                        id="context"
                        value={context}
                        onChange={(e) => dispatch({ type: 'SET_CONTEXT', payload: e.target.value })}
                        rows={2}
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                <div>
                    <label htmlFor="locale" className="block text-sm font-medium mb-1">
                        Language
                    </label>
                    <select
                        id="locale"
                        value={locale}
                        onChange={(e) => dispatch({ type: 'SET_LOCALE', payload: e.target.value as Locale })}
                        className="w-full p-2 border rounded-md"
                    >
                        {Object.entries(SUPPORTED_LOCALES).map(([code, name]) => (
                            <option key={code} value={code}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="translationLanguage" className="block text-sm font-medium mb-1">
                        Translation Language (optional)
                    </label>
                    <select
                        id="translationLanguage"
                        value={translationLanguage}
                        onChange={(e) => dispatch({ type: 'SET_TRANSLATION_LANGUAGE', payload: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="">No translation</option>
                        {Object.entries(SUPPORTED_LOCALES).map(([code, name]) => (
                            <option key={code} value={code}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading || !message.trim()}>
                    {isLoading ? 'Getting suggestions...' : 'Get Suggestions'}
                </Button>
            </form>

            {suggestError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-md mb-6">
                    <p className="font-semibold">Error</p>
                    <p>{suggestError.message || 'Failed to fetch suggestions'}</p>
                </div>
            )}

            {displaySuggestions && displaySuggestions.suggestions && (
                <div className="border rounded-md p-4">
                    <h2 className="text-lg font-semibold mb-4">
                        Suggestions {isLoading && <span className="text-sm font-normal text-gray-500">(Loading new results...)</span>}
                    </h2>
                    {!displaySuggestions.suggestions.length ? (
                        <p>No suggestions found</p>
                    ) : (
                        <ul className="space-y-4">
                            {displaySuggestions.suggestions.map((suggestion: { content?: string; translation?: string } | undefined, index: number) => {
                                return suggestion && suggestion.content ? (
                                    <li
                                        key={index}
                                        className="p-3 bg-gray-50 rounded-md border"
                                    >
                                        <div className="font-medium mb-1">{suggestion.content}</div>
                                        {suggestion.translation && (
                                            <div className="text-sm text-gray-600">
                                                Translation: {suggestion.translation}
                                            </div>
                                        )}
                                    </li>
                                ) : null;
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
