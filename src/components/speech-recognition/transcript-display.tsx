"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/locale/client';
import { Utterance } from '@/hooks/use-speech-recognition';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientSuggestion } from '@/types/suggestions';
import { SparklesIcon, MicIcon } from 'lucide-react';

interface TranscriptDisplayProps {
    finalUtterances: Utterance[];
    interimText: string;
    suggestionsWithId?: ClientSuggestion[];
    isLoading?: boolean;
    onSuggestionSelect?: (suggestion: ClientSuggestion) => void;
}

interface SuggestionsPosition {
    top: number;
    left: number;
    width: number;
}

/**
 * Component to display speech recognition transcripts, including final utterances and interim text
 */
export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
    finalUtterances,
    interimText,
    suggestionsWithId = [],
    isLoading = false,
    onSuggestionSelect
}) => {
    const t = useI18n();
    const hasContent = finalUtterances.length > 0 || interimText;
    const isSpeaking = interimText.length > 0;

    // State for client-side rendering and positioning
    const [state, setState] = useState({
        isClient: false,
        isPositionCalculated: false,
        suggestionsPosition: { top: 0, left: 0, width: 450 },
        showTranslation: true
    });

    // Refs for DOM elements
    const containerRef = useRef<HTMLDivElement>(null);
    const transcriptRef = useRef<HTMLDivElement>(null);
    const utteranceRefs = useRef<Record<string, HTMLSpanElement | null>>({});

    // Function to get the last utterance element
    const getLastUtteranceRect = useCallback((): DOMRect | null => {
        if (finalUtterances.length === 0) return null;

        const lastUtterance = finalUtterances[finalUtterances.length - 1];
        const lastElementRef = utteranceRefs.current[lastUtterance.id];

        if (!lastElementRef) return null;

        return lastElementRef.getBoundingClientRect();
    }, [finalUtterances]);

    // Calculate position for suggestions dropdown
    const calculateSuggestionsPosition = useCallback((): SuggestionsPosition => {
        if (!transcriptRef.current || !containerRef.current) {
            return { top: 0, left: 0, width: 450 };
        }

        const transcriptRect = transcriptRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const lastUtteranceRect = getLastUtteranceRect();

        // Calculate ideal width based on container
        const idealWidth = window.innerWidth < 640 ? window.innerWidth - 60 : 450;
        const maxWidth = Math.min(containerRect.width - 40, idealWidth);

        // Default positioning
        let top = transcriptRect.bottom - containerRect.top + 5;
        let left = 20;

        if (lastUtteranceRect) {
            // Position based on last utterance
            top = lastUtteranceRect.bottom - containerRect.top + 5;
            left = lastUtteranceRect.right - containerRect.left;

            // Adjust if extending beyond right edge
            if (left + maxWidth > containerRect.width - 20) {
                left = Math.max(20, containerRect.width - maxWidth - 20);
            }
        }

        return {
            top,
            left,
            width: maxWidth
        };
    }, [getLastUtteranceRect]);

    // Update position on client side
    const updateSuggestionsPosition = useCallback(() => {
        const newPosition = calculateSuggestionsPosition();

        setState(prevState => ({
            ...prevState,
            suggestionsPosition: newPosition,
            isPositionCalculated: true
        }));
    }, [calculateSuggestionsPosition]);

    // Set ref for utterance elements
    const setUtteranceRef = (el: HTMLSpanElement | null, id: string) => {
        if (el) {
            utteranceRefs.current[id] = el;
        }
    };

    // Handle suggestion selection
    const handleSuggestionSelect = (suggestion: ClientSuggestion) => {
        if (onSuggestionSelect) {
            onSuggestionSelect(suggestion);
        }
    };

    // Initialize client state
    useEffect(() => {
        setState(prevState => ({
            ...prevState,
            isClient: true
        }));
    }, []);

    // Update position when content changes
    useEffect(() => {
        if (!state.isClient) return;

        // Delay to ensure DOM is updated
        const timer = setTimeout(() => {
            updateSuggestionsPosition();
        }, 10);

        return () => clearTimeout(timer);
    }, [finalUtterances, interimText, state.isClient, updateSuggestionsPosition]);

    // Handle window resize
    useEffect(() => {
        if (!state.isClient) return;

        const handleResize = () => {
            updateSuggestionsPosition();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [state.isClient, updateSuggestionsPosition]);

    // CSS for shimmer effect - monochrome style
    const shimmerStyle = {
        backgroundImage: 'linear-gradient(90deg, rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.0) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite linear',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textFillColor: 'transparent',
        color: '#333333', // Fallback color
        textShadow: '0 0 1px rgba(0, 0, 0, 0.2)'
    };

    return (
        <>
            {/* CSS for shimmer animation */}
            <style jsx global>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>

            <div ref={containerRef} className="relative whitespace-normal min-h-[2em] text-left">
                {hasContent ? (
                    <div
                        ref={transcriptRef}
                        className="whitespace-pre-wrap"
                        style={{
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word'
                        }}
                    >
                        {/* Final utterances */}
                        {finalUtterances.map((utterance) => (
                            <span
                                ref={(el) => setUtteranceRef(el, utterance.id)}
                                key={utterance.id}
                                className="inline whitespace-normal"
                                style={{
                                    overflowWrap: 'anywhere',
                                    wordBreak: 'break-all'
                                }}
                            >
                                {utterance.text}
                            </span>
                        ))}

                        {/* Interim text with shimmer effect and speaking indicator */}
                        {isSpeaking && (
                            <span className="relative inline-flex items-center">
                                <span
                                    className="whitespace-normal font-medium"
                                    style={shimmerStyle}
                                >
                                    {' '}{interimText}
                                </span>
                                <span className="ml-1 inline-flex items-center">
                                    <MicIcon className="h-4 w-4 text-gray-500 animate-pulse" />
                                    <span className="ml-1 text-xs text-gray-500">
                                        ({interimText.length})
                                    </span>
                                </span>
                            </span>
                        )}
                    </div>
                ) : (
                    <span className="text-gray-400">
                        {t("main.prompt_speak")}
                    </span>
                )}

                {/* Autocomplete suggestions - Always shown */}
                {state.isClient && state.isPositionCalculated && (
                    <motion.div
                        className="absolute z-10 backdrop-blur-lg bg-white/95 border border-gray-200 rounded-md shadow-lg overflow-hidden divide-y divide-gray-300/40"
                        style={{
                            width: state.suggestionsPosition.width
                        }}
                        initial={{ opacity: 0 }}
                        animate={{
                            top: state.suggestionsPosition.top,
                            left: state.suggestionsPosition.left,
                            opacity: 1,
                            scale: 1,
                            transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 25
                            }
                        }}
                    >
                        {/* Display actual suggestions from the API */}
                        {suggestionsWithId.length > 0 ? (
                            suggestionsWithId.map((suggestion) => (
                                <div
                                    key={suggestion.id}
                                    className="cursor-pointer suggestion-item hover:bg-gray-200/30"
                                    onClick={() => handleSuggestionSelect(suggestion)}
                                >
                                    {/* Main content */}
                                    <div
                                        className="px-2 pt-2 pb-1 text-sm text-gray-800 whitespace-normal"
                                        style={{
                                            overflowWrap: 'anywhere',
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        {suggestion.content}
                                    </div>

                                    {/* Translation if available */}
                                    {state.showTranslation && suggestion.translation && (
                                        <div
                                            className="px-2 pb-1 text-xs text-gray-500 whitespace-normal"
                                            style={{
                                                overflowWrap: 'anywhere',
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            {suggestion.translation}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            // Empty state when no suggestions are available
                            <div className="px-2 py-1 text-sm text-gray-500 text-center">
                                {isLoading ? (
                                    <div className='flex items-center justify-center gap-2'>
                                        <div
                                            className={`animate-spin rounded-full border-2 border-gray-200 border-t-black/60`}
                                            style={{ width: 16, height: 16 }}
                                        />
                                        <span>Generating...</span>
                                    </div>
                                ) : (
                                    <div className='flex items-center justify-center gap-1'>
                                        <SparklesIcon className='size-4' />
                                        <span>Ready for suggestions...</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Loading placeholder - always shown when loading */}
                        {isLoading && (
                            <div className="cursor-pointer suggestion-item hover:bg-gray-200/30">
                                <div className="px-2 pt-2 pb-1">
                                    <Skeleton className="w-full h-5 mb-1 bg-gray-200" />
                                    <Skeleton className="w-1/4 h-5 mb-1 bg-gray-200" />
                                </div>

                                {state.showTranslation && (
                                    <div className="px-2 pb-1">
                                        <Skeleton className="w-5/6 h-3 mb-1 bg-gray-100" />
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </>
    );
};
