'use client';

import React, { useEffect, useRef } from 'react';
import { useUtterances } from '@/contexts/utterance-context';
import { SpeechRecognitionMinimal } from '@/components/speech-recognition-minimal';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { cn } from '@/lib/utils';
import { conversationSuggestionSchema } from '@/types/shared-types';
import { SuggestionsGrid } from '@/components/suggestions/suggestions-grid';
import { useSuggestions } from '@/hooks/use-suggestions';
import { ClientSuggestion } from '@/types/suggestions';
import { useI18n } from '@/locale/client';

interface MainContentProps {
  heroTitle: string;
  heroDescription: string;
}

export const MainContent: React.FC<MainContentProps> = ({
  heroTitle,
  heroDescription
}) => {
  // TypeScriptエラーを修正するために初期値を提供
  const submitRef = useRef<((data: { message: string }) => void) | undefined>(undefined);
  const resetHiddenRef = useRef<(() => void) | undefined>(undefined);
  const isLoadingRef = useRef<boolean>(false);

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

  // 関数や状態を ref に保存して最新の値を常に参照できるようにする
  useEffect(() => {
    submitRef.current = submit;
    resetHiddenRef.current = resetHidden;
    isLoadingRef.current = isLoading;
  }, [submit, resetHidden, isLoading]);


  const { utterances } = useUtterances();
  const t = useI18n();

  // Store the last processed utterance ID to avoid duplicate submissions
  const lastProcessedUtteranceIdRef = useRef<string | null>(null);

  // Watch for new final utterances and trigger submit
  useEffect(() => {
    if (utterances.length > 0 && submitRef.current) {
      const finalUtterances = utterances.filter(u => u.isFinal);

      if (finalUtterances.length > 0) {
        // Get the latest final utterance
        const latestUtterance = finalUtterances[finalUtterances.length - 1];

        // Only process if we haven't processed this utterance before
        if (latestUtterance.id !== lastProcessedUtteranceIdRef.current) {
          console.log('Processing new final utterance:', latestUtterance);
          lastProcessedUtteranceIdRef.current = latestUtterance.id;

          // Get all final utterances text combined
          const finalText = finalUtterances.map(u => u.text).join(' ');

          // Use the actual utterance text for auto-submission
          if (submitRef.current && finalText.trim()) {
            console.log('Auto-submitting with utterance text:', finalText);
            resetHidden();
            submitRef.current({
              message: finalText,
            });
          }
        }
      }
    }
  }, [utterances]);

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
            <div className="mt-6">
              <h2 className="font-serif text-md sm:text-lg md:text-xl lg:text-2xl font-semibold text-neutral-900 mb-2 sm:mb-3 lg:mb-4 leading-tight tracking-tight text-left">
                {t("main.suggestion_heading")}
              </h2>
              {isLoading && (
                <div className="mt-4 mb-3 text-center">
                  <div className="animate-pulse">Generating conversation suggestions...</div>
                </div>
              )}
              <SuggestionsGrid
                suggestionsWithId={suggestionsWithId}
                suggestionsState={suggestionsState}
                dispatch={dispatch}
                checkIsPinned={checkIsPinned}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
