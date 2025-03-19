'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useUtterances } from '@/contexts/utterance-context';
import { SpeechRecognitionMinimal } from '@/components/speech-recognition-minimal';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { cn } from '@/lib/utils';
import { conversationSuggestionSchema } from '@/types/shared-types';
import { SuggestionsGrid } from '@/components/suggestions/suggestions-grid';
import { useSuggestions } from '@/hooks/use-suggestions';
import { ClientSuggestion } from '@/types/suggestions';
import { useI18n } from '@/locale/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

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

  // 発話間隔の設定（デフォルトは1 = 毎回）
  const [utteranceInterval, setUtteranceInterval] = useState<number>(2);
  // 発話カウンター
  const utteranceCounterRef = useRef<number>(0);

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

  // Watch for new final utterances and trigger submit based on interval
  useEffect(() => {
    if (utterances.length > 0 && submitRef.current) {
      const finalUtterances = utterances.filter(u => u.isFinal);

      if (finalUtterances.length > 0) {
        // Get the latest final utterance
        const latestUtterance = finalUtterances[finalUtterances.length - 1];

        // Only process if we haven't processed this utterance before
        if (latestUtterance.id !== lastProcessedUtteranceIdRef.current) {
          lastProcessedUtteranceIdRef.current = latestUtterance.id;
          // Increment the counter
          utteranceCounterRef.current += 1;
          // Check if we should submit based on the interval
          const shouldSubmit = utteranceCounterRef.current >= utteranceInterval;

          if (shouldSubmit) {
            // Get all final utterances text combined
            const finalText = finalUtterances.map(u => u.text).join(' ');
            // Use the actual utterance text for auto-submission
            if (submitRef.current && finalText.trim()) {
              console.log('Auto-submitting with utterance text:', finalText);
              if (resetHiddenRef.current) {
                resetHiddenRef.current();
              }
              submitRef.current({
                message: finalText,
              });

              // Reset the counter after submission
              utteranceCounterRef.current = 0;
            }
          }
        }
      }
    }
  }, [utterances, utteranceInterval]);

  // Check if utterances exist
  const hasUtterances = utterances.length > 0;

  // 間隔設定用のヘルパー関数
  const handleIntervalChange = (value: string) => {
    const interval = parseInt(value, 10);
    setUtteranceInterval(interval);
    utteranceCounterRef.current = 0; // カウンターをリセット
    console.log(`Utterance interval set to ${interval}`);
  };

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

            {/* 発話間隔設定コントロール */}
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="w-48">
                <Select
                  value={utteranceInterval.toString()}
                  onValueChange={handleIntervalChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="発話頻度設定" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">毎回生成</SelectItem>
                    <SelectItem value="2">2回に1回</SelectItem>
                    <SelectItem value="3">3回に1回</SelectItem>
                    <SelectItem value="5">5回に1回</SelectItem>
                    <SelectItem value="10">10回に1回</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>サジェスチョンを生成する頻度を設定します。<br />「毎回生成」では全ての発話に対してサジェスチョンを生成し、<br />「3回に1回」では3つの発話ごとに1回だけ生成します。</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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