'use client';

import React, { useEffect, useReducer, useState, useMemo } from 'react';
import { useUtterances } from '@/contexts/utterance-context';
import { SpeechRecognitionMinimal } from '@/components/speech-recognition-minimal';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PinIcon, Trash2Icon } from 'lucide-react';
import { conversationSuggestionSchema } from '@/types/shared-types';
import { useI18n } from '@/locale/client';

interface MainContentProps {
  heroTitle: string;
  heroDescription: string;
}

// Base suggestion type definition (returned from server)
interface BaseSuggestion {
  category?: string;
  confidenceLevel?: number;
  content?: string;
  translation?: string;
}

// Client-side extended suggestion type
interface ClientSuggestion extends BaseSuggestion {
  id: string; // Required ID (generated on client-side)
  isPinned?: boolean;
}

// SuggestionCard component props type
interface SuggestionCardProps {
  suggestion: ClientSuggestion;
  isPinned: boolean;
  onTogglePin: () => void;
  onHide: () => void;
  isDisabled?: boolean;
}

// Reducer state type
interface SuggestionsState {
  hiddenIndices: Set<number>;
  pinnedSuggestions: ClientSuggestion[];
}

// Reducer action types
type SuggestionsAction =
  | { type: 'HIDE_SUGGESTION'; index: number }
  | { type: 'TOGGLE_PIN'; suggestion: ClientSuggestion }
  | { type: 'UNPIN_SUGGESTION'; index: number }
  | { type: 'RESET_HIDDEN' };

// Function to generate unique ID
const generateUniqueId = (): string => {
  return `suggestion-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Function to get category color
function getCategoryColor(category?: string): string {
  switch (category) {
    case 'deeper_reflection':
      return 'bg-blue-100 text-blue-800';
    case 'additional_details':
      return 'bg-green-100 text-green-800';
    case 'question_expansion':
      return 'bg-yellow-100 text-yellow-800';
    case 'related_topics':
      return 'bg-purple-100 text-purple-800';
    case 'personal_opinion':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Shared SuggestionCard component
const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  isPinned,
  onTogglePin,
  onHide,
  isDisabled = false
}) => {
  const t = useI18n();

  return (
    <div
      className={`bg-white shadow rounded-lg p-4 ${isPinned ? 'pb-6' : 'pb-10'} ${isPinned ? 'border-2 border-blue-200' : 'border border-gray-200'
        } flex flex-col min-h-40 justify-start h-full relative`}
    >
      <div className="flex justify-between items-start">
        <span className="font-semibold text-gray-900 text-md">
          {t(`categories.${suggestion.category}` as keyof typeof t)}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(suggestion.category)}`}>
          {suggestion.confidenceLevel}%
        </span>
      </div>
      <p className="mt-2 text-gray-600 text-left text-sm">{suggestion.content}</p>
      {
        suggestion.translation && (
          <div className='w-full h-[1px] bg-gray-100 my-2' />
        )
      }

      {
        suggestion.translation && <span className='text-gray-600 text-sm text-left'>
          <span className='font-medium bg-gray-100 text-gray-400 px-1 py-0.5 mr-1 -ml-1 text-xs rounded-[3px] text-left'>Translation</span>{suggestion.translation}
        </span>
      }
      <div className="absolute -bottom-2 right-1">
        <div className="mb-3 scale-80 origin-bottom-right flex flex-row gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={isDisabled}
            onClick={onHide}
          >
            <Trash2Icon />
          </Button>
          <Button
            variant={isPinned ? "default" : "outline"}
            size="icon"
            disabled={isDisabled}
            onClick={onTogglePin}
          >
            <PinIcon />
          </Button>
        </div>
      </div>
    </div>
  );
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

export const MainContent: React.FC<MainContentProps> = ({
  heroTitle,
  heroDescription
}) => {
  const [transcription, setTranscription] = useState('大学の研究で認知言語学について調べていて、特に言語がどのように人間の思考パターンを形成するかという点に興味があります。サピア・ウォーフの仮説では、使用する言語によって世界の認識の仕方が変わるとされていますが、最近の研究では部分的に支持されつつも批判も多いことを知りました。例えば、色彩語彙と色の認識には確かに関連性があるようですが、思考全体を言語が決定づけるわけではないようです。'); // Default value

  const { submit, isLoading, object } = useObject({
    api: "/api/suggest",
    schema: conversationSuggestionSchema,
  });

  // Assign IDs to suggestions returned from API
  const suggestionsWithId = useMemo<ClientSuggestion[]>(() => {
    if (!object?.suggestions) return [];

    return object.suggestions.map((suggestion): ClientSuggestion => ({
      ...suggestion,
      id: generateUniqueId()
    }));
  }, [object?.suggestions]);

  // Use reducer for suggestions state management
  const [suggestionsState, dispatch] = useReducer(suggestionsReducer, {
    hiddenIndices: new Set<number>(),
    pinnedSuggestions: []
  });

  // Function to check if a suggestion is pinned
  const checkIsPinned = (suggestion: ClientSuggestion): boolean => {
    return suggestionsState.pinnedSuggestions.some(pinned => pinned.id === suggestion.id);
  };

  const handleSubmit = () => {
    // Reset hidden state
    dispatch({ type: 'RESET_HIDDEN' });
    // Keep pinned suggestions

    // Pass string directly
    submit({
      message: transcription,
    });
  };

  const { utterances, setUtterances } = useUtterances();

  const {
    utterances: speechUtterances,
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    onFinalUtterance(utterance, allUtterances) {
      // Update the context with all utterances
      setUtterances(allUtterances);
    },
  });

  // Keep the context updated with speechUtterances
  useEffect(() => {
    setUtterances(speechUtterances);
  }, [speechUtterances, setUtterances]);


  // const clearAllUtterances = () => {
  //   setUtterances([]);
  // };

  // Check if utterances exist
  const hasUtterances = utterances.length > 0;

  return (
    <main className="flex-grow flex flex-col">
      {/* Hero Section */}
      <section className="flex-grow flex justify-center items-start py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-6xl 2xl:max-w-5xl text-center">
          {/* Add wrapper container with fixed height */}
          <div
            className={cn(
              "transition-all duration-1200 ease-custom h-auto",
              hasUtterances ? "mt-0" : "mt-48"
            )}
          >
            {/* Apply transform to this element */}
            <div
              className={cn(
                "transform transition-transform duration-1000 ease-custom origin-center",
                hasUtterances ? "scale-80" : "scale-100"
              )}
            >
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-neutral-900 mb-4 sm:mb-6 lg:mb-8 leading-tight tracking-tight">
                {heroTitle}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-neutral-700 mb-8 sm:mb-10 lg:mb-12 font-light leading-relaxed tracking-tight max-w-3xl mx-auto lg:max-w-4xl xl:max-w-5xl">
                {heroDescription}
              </p>
            </div>
          </div>

          <div className='w-full mb-8'>
            <SpeechRecognitionMinimal />
          </div>

          <div className='mt-8'>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Voice Input</h2>
              {/* <SpeechToTextWrapper onTranscriptionChange={handleTranscriptionChange} /> */}
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-24"
                placeholder="Please enter voice input..."
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || !transcription.trim()}
            >
              Generate Suggestions
            </Button>
            <div className="mt-6">
              <h2 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-neutral-900 mb-2 sm:mb-3 lg:mb-4 leading-tight tracking-tight text-left">
                You can probably say...
              </h2>

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
            </div>
            {isLoading && (
              <div className="mt-6 text-center">
                <div className="animate-pulse">Generating conversation suggestions...</div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};