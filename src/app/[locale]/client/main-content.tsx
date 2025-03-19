'use client';

import React, { useState, useEffect } from 'react';
import { useUtterances } from '@/contexts/utterance-context';
import { SpeechRecognitionMinimal } from '@/components/speech-recognition-minimal';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { conversationSuggestionSchema } from '@/types/shared-types';
import { SuggestionsGrid } from '@/components/suggestions/suggestions-grid';
import { useSuggestions } from '@/hooks/use-suggestions';
import { ClientSuggestion } from '@/types/suggestions';

interface MainContentProps {
  heroTitle: string;
  heroDescription: string;
}

export const MainContent: React.FC<MainContentProps> = ({
  heroTitle,
  heroDescription
}) => {
  const [transcription, setTranscription] = useState('大学の研究で認知言語学について調べていて、特に言語がどのように人間の思考パターンを形成するかという点に興味があります。'); // Default value

  const { submit, isLoading, object } = useObject({
    api: "/api/suggest",
    schema: conversationSuggestionSchema,
  });

  // Use our custom hook for suggestions management
  const {
    suggestionsState,
    suggestionsWithId,
    dispatch,
    checkIsPinned,
    resetHidden
  } = useSuggestions(
    object?.suggestions?.filter((suggestion): suggestion is ClientSuggestion => !!suggestion) || []
  );

  const handleSubmit = () => {
    // Reset hidden state
    resetHidden();

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

              <SuggestionsGrid
                suggestionsWithId={suggestionsWithId}
                suggestionsState={suggestionsState}
                dispatch={dispatch}
                checkIsPinned={checkIsPinned}
                isLoading={isLoading}
              />
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