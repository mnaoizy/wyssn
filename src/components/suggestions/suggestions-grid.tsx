'use client';

import React from 'react';
import { SuggestionCard } from './suggestion-card';
import { ClientSuggestion, SuggestionsAction, SuggestionsState } from '@/types/suggestions';

interface SuggestionsGridProps {
    suggestionsWithId: ClientSuggestion[];
    suggestionsState: SuggestionsState;
    dispatch: React.Dispatch<SuggestionsAction>;
    checkIsPinned: (suggestion: ClientSuggestion) => boolean;
    isLoading?: boolean;
}

export const SuggestionsGrid: React.FC<SuggestionsGridProps> = ({
    suggestionsWithId,
    suggestionsState,
    dispatch,
    checkIsPinned,
    isLoading = false
}) => {
    // Create a map of pinned content for duplicate detection
    const pinnedContents = new Map<string, boolean>();

    // Store pinned content for duplicate checking
    suggestionsState.pinnedSuggestions.forEach(suggestion => {
        if (suggestion.content) {
            pinnedContents.set(suggestion.content, true);
        }
    });

    // For tracking content we see during this render to avoid
    // duplicates within the regular suggestions
    const seenContents = new Set<string>();

    return (
        <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {/* Display pinned suggestions */}
            {suggestionsState.pinnedSuggestions.map((suggestion, index) => (
                <SuggestionCard
                    key={`pinned-${suggestion.id}`}
                    suggestion={suggestion}
                    isPinned={true}
                    onTogglePin={() => dispatch({ type: 'TOGGLE_PIN', suggestion })}
                    onHide={() => dispatch({ type: 'UNPIN_SUGGESTION', index })}
                />
            ))}

            {/* Display regular suggestions (filtering duplicates by content) */}
            {suggestionsWithId.map((suggestion, index) => {
                const content = suggestion.content || '';

                // Skip if:
                // 1. This suggestion is hidden by index, OR
                // 2. This suggestion is already pinned by ID, OR
                // 3. This suggestion's content matches a pinned suggestion's content, OR
                // 4. We've already seen this content in the current render of regular suggestions
                if (
                    suggestionsState.hiddenIndices.has(index) ||
                    checkIsPinned(suggestion) ||
                    (content && pinnedContents.has(content)) ||
                    (content && seenContents.has(content))
                ) {
                    return null;
                }

                // Add this content to seen set to prevent duplicates within regular suggestions
                if (content) {
                    seenContents.add(content);
                }

                return (
                    <SuggestionCard
                        key={`regular-${suggestion.id}-${index}`}
                        suggestion={suggestion}
                        isPinned={false}
                        onTogglePin={() => dispatch({ type: 'TOGGLE_PIN', suggestion })}
                        onHide={() => dispatch({ type: 'HIDE_SUGGESTION', index })}
                        isDisabled={isLoading}
                    />
                );
            })}
        </div>
    );
};