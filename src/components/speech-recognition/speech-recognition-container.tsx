"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSpeechRecognition, MicButton } from '@/hooks/use-speech-recognition';
import { useUtterances } from '@/contexts/utterance-context';
import { useCurrentLocale } from '@/locale/client';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { cn } from '@/lib/utils';
import { conversationSuggestionSchema } from '@/types/shared-types';
import { SuggestionsGrid } from '@/components/suggestions/suggestions-grid';
import { useSuggestions } from '@/hooks/use-suggestions';
import { ClientSuggestion } from '@/types/suggestions';
import { Spinner } from '@/components/spinner';

// Import our new components
import { RecognitionStatus } from './recognition-status';
import { TranscriptDisplay } from './transcript-display';
import { ControlPanel } from './control-panel';

export interface SpeechRecognitionProps {
    heroTitle?: string;
    heroDescription?: string;
    utteranceInterval?: number;
    onUtteranceIntervalChange?: (interval: number) => void;
}

/**
 * Container component for the speech recognition feature,
 * orchestrating all sub-components and managing state
 */
export const SpeechRecognitionContainer: React.FC<SpeechRecognitionProps> = ({
    heroTitle,
    heroDescription,
    utteranceInterval = 2,
    onUtteranceIntervalChange
}) => {
    // Add client-side only initialization
    const [mounted, setMounted] = useState(false);
    // Get utterances from context instead of just from the hook
    const { utterances: contextUtterances, setUtterances } = useUtterances();
    // Add state for displaying interim text
    const [interimText, setInterimText] = useState('');
    // Add state for utterance interval if no prop is provided
    const [localUtteranceInterval, setLocalUtteranceInterval] = useState(utteranceInterval);
    // 発話カウンター
    const utteranceCounterRef = useRef<number>(0);

    // References for submission functionality
    const submitRef = useRef<((data: { message: string }) => void) | undefined>(undefined);
    const resetHiddenRef = useRef<(() => void) | undefined>(undefined);
    const isLoadingRef = useRef<boolean>(false);

    const { submit, isLoading, object } = useObject({
        api: "/api/suggest",
        schema: conversationSuggestionSchema,
    });

    // Use custom hook for suggestions management
    const {
        suggestionsState,
        suggestionsWithId,
        dispatch,
        checkIsPinned,
        resetHidden
    } = useSuggestions(
        object?.suggestions?.filter((suggestion): suggestion is ClientSuggestion => !!suggestion) || []
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    // Store the last processed utterance ID to avoid duplicate submissions
    const lastProcessedUtteranceIdRef = useRef<string | null>(null);

    // 関数や状態を ref に保存して最新の値を常に参照できるようにする
    useEffect(() => {
        submitRef.current = submit;
        resetHiddenRef.current = resetHidden;
        isLoadingRef.current = isLoading;
    }, [submit, resetHidden, isLoading]);

    const {
        isListening,
        error,
        isSupported,
        utterances: speechUtterances,
        interimTranscript, // Get the current interim transcription
        startListening,
        stopListening,
        changeLanguage
    } = useSpeechRecognition({
        continuous: true,
        shouldPersistTranscript: true,
        interimResults: true,
        onFinalUtterance(utterance, allUtterances) {
            // Retain all utterances but control what is displayed
            setUtterances(allUtterances);
            // Clear interim transcription (since it has been finalized)
            setInterimText('');
        },
    });

    const currentLocale = useCurrentLocale();

    useEffect(() => {
        if (currentLocale) {
            changeLanguage(currentLocale);
        }
    }, [currentLocale]);

    // Watch for new final utterances and trigger submit based on interval
    useEffect(() => {
        if (contextUtterances.length > 0 && submitRef.current) {
            const finalUtterances = contextUtterances.filter(u => u.isFinal);

            if (finalUtterances.length > 0) {
                // Get the latest final utterance
                const latestUtterance = finalUtterances[finalUtterances.length - 1];

                // Only process if we haven't processed this utterance before
                if (latestUtterance.id !== lastProcessedUtteranceIdRef.current) {
                    lastProcessedUtteranceIdRef.current = latestUtterance.id;
                    // Increment the counter
                    utteranceCounterRef.current += 1;
                    // Check if we should submit based on the interval
                    const currentInterval = onUtteranceIntervalChange ? utteranceInterval : localUtteranceInterval;
                    const shouldSubmit = utteranceCounterRef.current >= currentInterval;

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
    }, [contextUtterances, utteranceInterval, localUtteranceInterval, onUtteranceIntervalChange]);

    // Update interim transcription
    useEffect(() => {
        if (interimTranscript) {
            setInterimText(interimTranscript);
        }
    }, [interimTranscript]);

    // Auxiliary useEffect to reflect the hook's utterance history in the context
    useEffect(() => {
        if (speechUtterances.length > 0) {
            const existingIds = new Set(contextUtterances.map(u => u.id));
            const newUtterances = speechUtterances.filter(u => !existingIds.has(u.id));

            if (newUtterances.length > 0) {
                setUtterances([...contextUtterances, ...newUtterances]);
            }
        }
    }, [speechUtterances, contextUtterances, setUtterances]);

    // Get only finalized utterances
    const finalUtterances = contextUtterances
        .filter(u => u.isFinal)
        .sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp in ascending order

    // Check if utterances exist
    const hasUtterances = contextUtterances.length > 0;

    // Helper function to handle interval changes
    const handleUtteranceIntervalChange = (interval: number) => {
        setLocalUtteranceInterval(interval);
        utteranceCounterRef.current = 0; // カウンターをリセット
    };

    return (
        <main className="flex-grow flex flex-col">
            {/* Hero Section */}
            <section className="flex-grow flex justify-center items-start py-8 sm:py-10 md:py-12 lg:py-16">
                <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-6xl 2xl:max-w-5xl text-center">
                    {/* Add wrapper container with fixed height */}
                    {heroTitle && heroDescription && (
                        <div
                            className={cn(
                                "transition-all duration-1200 ease-custom h-auto",
                                hasUtterances ? "mt-0" : "mt-16 md:mt-48"
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
                    )}

                    {
                        mounted ? (
                            <div className="w-full max-w-full p-4 border rounded-lg shadow-sm mb-8">
                                {/* Control Panel */}
                                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                    <ControlPanel
                                        utteranceInterval={onUtteranceIntervalChange ? utteranceInterval : localUtteranceInterval}
                                        onUtteranceIntervalChange={handleUtteranceIntervalChange}
                                        onExternalIntervalChange={onUtteranceIntervalChange}
                                    />

                                    {mounted && (
                                        <MicButton
                                            isListening={isListening}
                                            onStart={startListening}
                                            onStop={stopListening}
                                            disabled={!isSupported}
                                        />
                                    )}
                                </div>

                                {/* Recognition Status */}
                                <RecognitionStatus error={error} isSupported={isSupported} />

                                {/* Transcript Display */}
                                <TranscriptDisplay
                                    finalUtterances={finalUtterances}
                                    interimText={interimText}
                                />
                            </div>
                        ) : (
                            <div className='flex justify-center items-center h-32'>
                                <Spinner />
                            </div>
                        )
                    }

                    <div className='mt-8'>
                        <div className="mt-6">
                            {
                                (suggestionsWithId.length > 0 || suggestionsState.pinnedSuggestions?.length > 0) && (
                                    <div className='flex flex-row justify-between items-center mb-2 sm:mb-3 lg:mb-4 '>
                                        <h2 className="font-serif text-md sm:text-lg md:text-xl lg:text-2xl font-semibold text-neutral-900 leading-tight tracking-tight text-left">
                                            Conversation Suggestions
                                        </h2>
                                        {
                                            isLoading && (
                                                <div className="animate-pulse">Generating conversation suggestions...</div>
                                            )
                                        }
                                    </div>
                                )
                            }
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
