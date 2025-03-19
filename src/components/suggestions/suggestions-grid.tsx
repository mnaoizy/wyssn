'use client';

import React from 'react';
import { SuggestionCard } from '@/components/suggestions/suggestion-card';
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

            {/* Display regular suggestions (only those not pinned) */}
            {suggestionsWithId.map((suggestion, index) => (
                // Only display suggestions not in hiddenIndices and not pinned
                !suggestionsState.hiddenIndices.has(index) && !checkIsPinned(suggestion) && (
                    <SuggestionCard
                        key={`regular-${suggestion.id}`}
                        suggestion={suggestion}
                        isPinned={false}
                        onTogglePin={() => dispatch({ type: 'TOGGLE_PIN', suggestion })}
                        onHide={() => dispatch({ type: 'HIDE_SUGGESTION', index })}
                        isDisabled={isLoading}
                    />
                )
            ))}
        </div>
    );
};