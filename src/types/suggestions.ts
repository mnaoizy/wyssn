// Base suggestion type definition (returned from server)
export interface BaseSuggestion {
    category?: string;
    confidenceLevel?: number;
    content?: string;
    translation?: string;
}

// Client-side extended suggestion type
export interface ClientSuggestion extends BaseSuggestion {
    id: string; // Required ID (generated on client-side)
    isPinned?: boolean;
}

// Reducer state type
export interface SuggestionsState {
    hiddenIndices: Set<number>;
    pinnedSuggestions: ClientSuggestion[];
}

// Reducer action types
export type SuggestionsAction =
    | { type: 'HIDE_SUGGESTION'; index: number }
    | { type: 'TOGGLE_PIN'; suggestion: ClientSuggestion }
    | { type: 'UNPIN_SUGGESTION'; index: number }
    | { type: 'RESET_HIDDEN' };