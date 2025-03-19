'use client';

import { useReducer, useMemo } from 'react';
import { ClientSuggestion, SuggestionsState, SuggestionsAction } from '@/types/suggestions';

// Function to generate unique ID
const generateUniqueId = (): string => {
    return `suggestion-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Reducer function
const suggestionsReducer = (state: SuggestionsState, action: SuggestionsAction): SuggestionsState => {
    switch (action.type) {
        case 'HIDE_SUGGESTION':
            // Add to hidden indices
            const newHiddenIndices = new Set(state.hiddenIndices);
            newHiddenIndices.add(action.index);
            return {
                ...state,
                hiddenIndices: newHiddenIndices
            };

        case 'TOGGLE_PIN':
            const suggestion = action.suggestion;

            // Find existing pinned index
            const existingPinIndex = state.pinnedSuggestions.findIndex(
                pinned => pinned.id === suggestion.id
            );

            if (existingPinIndex >= 0) {
                // Unpin
                return {
                    ...state,
                    pinnedSuggestions: state.pinnedSuggestions.filter((_, i) => i !== existingPinIndex)
                };
            } else {
                // Pin
                return {
                    ...state,
                    pinnedSuggestions: [...state.pinnedSuggestions, { ...suggestion, isPinned: true }]
                };
            }

        case 'UNPIN_SUGGESTION':
            // Remove pinned suggestion at the specified index
            return {
                ...state,
                pinnedSuggestions: state.pinnedSuggestions.filter((_, i) => i !== action.index)
            };

        case 'RESET_HIDDEN':
            // Reset hidden state
            return {
                ...state,
                hiddenIndices: new Set()
            };

        default:
            return state;
    }
};

export function useSuggestions(initialSuggestions?: ClientSuggestion[]) {
    // Use reducer for suggestions state management
    const [suggestionsState, dispatch] = useReducer(suggestionsReducer, {
        hiddenIndices: new Set<number>(),
        pinnedSuggestions: []
    });

    // Assign IDs to suggestions if provided
    const suggestionsWithId = useMemo<ClientSuggestion[]>(() => {
        if (!initialSuggestions) return [];

        return initialSuggestions.map((suggestion): ClientSuggestion => ({
            ...suggestion,
            id: generateUniqueId()
        }));
    }, [initialSuggestions]);

    // Function to check if a suggestion is pinned using ID
    const checkIsPinned = (suggestion: ClientSuggestion): boolean => {
        return suggestionsState.pinnedSuggestions.some(
            pinned => pinned.id === suggestion.id
        );
    };

    // Function to check for content duplication
    const hasDuplicateContent = (suggestion: ClientSuggestion): boolean => {
        return suggestionsState.pinnedSuggestions.some(
            pinned => pinned.content === suggestion.content
        );
    };

    // Function to reset hidden suggestions
    const resetHidden = () => {
        dispatch({ type: 'RESET_HIDDEN' });
    };

    return {
        suggestionsState,
        suggestionsWithId,
        dispatch,
        checkIsPinned,
        hasDuplicateContent,
        resetHidden
    };
}