'use client';

import { useReducer, useEffect, useCallback, useRef } from 'react';
import { MicIcon, MicOffIcon } from 'lucide-react';
import { Locale } from '@/locale/config';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type LanguageCode = Locale;

// Utterance type
export interface Utterance {
    id: string;
    text: string;
    timestamp: number;
    confidence: number;
    isFinal: boolean;
    lang?: LanguageCode;
}

// Options for speech recognition
export interface SpeechRecognitionOptions {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: LanguageCode;
    shouldPersistTranscript?: boolean;
    onFinalUtterance?: (utterance: Utterance, allUtterances: Utterance[]) => void;
}

// Hook return type
export interface UseSpeechRecognitionReturn {
    isListening: boolean;
    transcript: string;
    finalTranscript: string;
    interimTranscript: string;
    error: Error | null;
    isSupported: boolean;
    utterances: Utterance[];
    currentLanguage: LanguageCode;
    startListening: (options?: SpeechRecognitionOptions) => void;
    stopListening: () => void;
    resetTranscript: () => void;
    clearUtterances: () => void;
    changeLanguage: (lang: LanguageCode) => void;
}

// Web Speech API types for better type safety
interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: { transcript: string; confidence: number };
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
    timeStamp: number;
}

interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

// Browser compatibility
declare global {
    interface Window {
        SpeechRecognition: {
            new(): SpeechRecognitionInstance;
            prototype: SpeechRecognitionInstance;
        };
        webkitSpeechRecognition: {
            new(): SpeechRecognitionInstance;
            prototype: SpeechRecognitionInstance;
        };
    }
}

const SpeechRecognition = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

// State for the reducer
interface SpeechRecognitionState {
    isListening: boolean;
    transcript: string;
    finalTranscript: string;
    interimTranscript: string;
    error: Error | null;
    utterances: Utterance[];
    currentLanguage: LanguageCode;
}

// Actions for the reducer
type SpeechRecognitionAction =
    | { type: 'START_LISTENING' }
    | { type: 'STOP_LISTENING' }
    | { type: 'SET_ERROR', payload: Error }
    | { type: 'RESET_TRANSCRIPT', payload?: { keepUtterances?: boolean } }
    | { type: 'CLEAR_UTTERANCES' }
    | { type: 'CHANGE_LANGUAGE', payload: LanguageCode }
    | {
        type: 'UPDATE_RESULTS', payload: {
            finalText: string,
            interimText: string,
            newUtterances: Utterance[],
            persistTranscript: boolean
        }
    };

// Initial state
const initialState: SpeechRecognitionState = {
    isListening: false,
    transcript: '',
    finalTranscript: '',
    interimTranscript: '',
    error: null,
    utterances: [],
    currentLanguage: 'en-US'
};

// Generate a unique ID for each utterance
const generateId = (): string => Math.random().toString(36).substring(2, 11);

// We need an utterance history that persists between renders
const utteranceHistory: Utterance[] = [];

// Reducer function
function speechRecognitionReducer(state: SpeechRecognitionState, action: SpeechRecognitionAction): SpeechRecognitionState {
    switch (action.type) {
        case 'START_LISTENING':
            return { ...state, isListening: true, error: null };
        case 'STOP_LISTENING':
            return { ...state, isListening: false };
        case 'SET_ERROR':
            return { ...state, error: action.payload, isListening: false };
        case 'RESET_TRANSCRIPT': {
            const keepUtterances = action.payload?.keepUtterances || false;
            return {
                ...state,
                transcript: '',
                finalTranscript: '',
                interimTranscript: '',
                utterances: keepUtterances ? state.utterances : []
            };
        }
        case 'CLEAR_UTTERANCES':
            return { ...state, utterances: [] };
        case 'CHANGE_LANGUAGE':
            return { ...state, currentLanguage: action.payload };
        case 'UPDATE_RESULTS': {
            const { finalText, interimText, newUtterances, persistTranscript } = action.payload;
            const updatedUtterances = persistTranscript
                ? [...state.utterances, ...newUtterances]
                : newUtterances;

            return {
                ...state,
                // transcript: (finalText || '') + (interimText ? ' ' + interimText : ''),
                finalTranscript: finalText,
                interimTranscript: interimText,
                utterances: updatedUtterances
            };
        }
        default:
            return state;
    }
}

/**
 * React hook for speech recognition with support for utterance history
 */
export const useSpeechRecognition = (
    options: SpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {
    const [state, dispatch] = useReducer(speechRecognitionReducer, {
        ...initialState,
        currentLanguage: options.lang || initialState.currentLanguage
    });

    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const isSupported = !!SpeechRecognition;
    const optionsRef = useRef(options);

    // Update options ref when options change
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    // Cleanup recognition instance
    const cleanupRecognition = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onresult = null;
            recognitionRef.current.onerror = null;
            recognitionRef.current.onend = null;
            recognitionRef.current.onstart = null;
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
    }, []);

    // Stop listening function
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.error('Error stopping speech recognition:', error);
            }
        }
        dispatch({ type: 'STOP_LISTENING' });
    }, []);

    // Start listening
    const startListening = useCallback(
        (customOptions: SpeechRecognitionOptions = {}) => {
            if (!isSupported) {
                dispatch({
                    type: 'SET_ERROR',
                    payload: new Error('Speech recognition is not supported in this browser')
                });
                return;
            }

            cleanupRecognition();

            try {
                const mergedOptions = {
                    ...optionsRef.current,
                    ...customOptions,
                    lang: customOptions.lang || state.currentLanguage
                };

                const recognition = new SpeechRecognition();

                recognition.continuous = !!mergedOptions.continuous;
                recognition.interimResults = !!mergedOptions.interimResults;
                recognition.lang = mergedOptions.lang || state.currentLanguage;

                const persistTranscript = mergedOptions.shouldPersistTranscript !== false;

                if (!persistTranscript) {
                    dispatch({ type: 'RESET_TRANSCRIPT' });
                }

                recognition.onresult = (event: SpeechRecognitionEvent) => {
                    let interimText = '';
                    let finalText = persistTranscript ? state.finalTranscript : '';
                    const currentTime = event.timeStamp || Date.now();
                    const currentLang = recognition.lang as LanguageCode;
                    const newUtterances: Utterance[] = [];

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const result = event.results[i];
                        const transcriptText = result[0].transcript.trim();
                        const confidence = result[0].confidence;

                        if (transcriptText) {
                            if (result.isFinal) {
                                finalText += (finalText ? '' : '') + transcriptText;

                                // Add final utterance with language info
                                newUtterances.push({
                                    id: generateId(),
                                    text: transcriptText,
                                    timestamp: currentTime,
                                    confidence: confidence,
                                    isFinal: true,
                                    lang: currentLang
                                });
                            } else {
                                interimText += ' ' + transcriptText;
                                // Add interim utterance with language info
                                if (mergedOptions.interimResults) {
                                    newUtterances.push({
                                        id: generateId(),
                                        text: transcriptText,
                                        timestamp: currentTime,
                                        confidence: confidence,
                                        isFinal: false,
                                        lang: currentLang
                                    });
                                }
                            }
                        }
                    }

                    // Update state with new results
                    dispatch({
                        type: 'UPDATE_RESULTS',
                        payload: {
                            finalText,
                            interimText,
                            newUtterances,
                            persistTranscript
                        }
                    });

                    // Before updating state, add only FINAL utterances to our global history if persistence is enabled
                    const finalUtterances = newUtterances.filter(u => u.isFinal);

                    if (persistTranscript && finalUtterances.length > 0) {
                        // Add only final utterances to our history
                        utteranceHistory.push(...finalUtterances);
                    } else if (!persistTranscript) {
                        // Clear history and add only new final utterances
                        utteranceHistory.length = 0;
                        if (finalUtterances.length > 0) {
                            utteranceHistory.push(...finalUtterances);
                        }
                    }

                    // Call onFinalUtterance callback for each new final utterance
                    const onFinalUtterance = mergedOptions.onFinalUtterance;
                    if (onFinalUtterance && typeof onFinalUtterance === 'function' && finalUtterances.length > 0) {
                        // Use the last final utterance from this batch
                        const lastFinalUtterance = finalUtterances[finalUtterances.length - 1];

                        // Call the callback with only the final utterances history
                        console.log('Calling onFinalUtterance with final utterances history:', {
                            utterance: lastFinalUtterance,
                            historyLength: utteranceHistory.length,
                            finalOnly: true
                        });

                        onFinalUtterance(lastFinalUtterance, [...utteranceHistory]);
                    }
                };

                recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                    dispatch({ type: 'SET_ERROR', payload: new Error(event.error) });
                };

                recognition.onend = () => {
                    dispatch({ type: 'STOP_LISTENING' });
                };

                recognition.onstart = () => {
                    dispatch({ type: 'START_LISTENING' });
                };

                // Start recognition
                recognition.start();
                recognitionRef.current = recognition;
            } catch (error) {
                dispatch({
                    type: 'SET_ERROR',
                    payload: error instanceof Error ? error : new Error('Unknown error occurred')
                });
            }
        },
        [cleanupRecognition, isSupported, state.finalTranscript, state.currentLanguage]
    );

    // Reset transcript function
    const resetTranscript = useCallback(() => {
        // Also reset the global utterance history
        utteranceHistory.length = 0;
        dispatch({ type: 'RESET_TRANSCRIPT' });
    }, []);

    // Clear utterances only
    const clearUtterances = useCallback(() => {
        // Also clear the global utterance history
        utteranceHistory.length = 0;
        dispatch({ type: 'CLEAR_UTTERANCES' });
    }, []);

    // Change language - defining after startListening to avoid circular deps
    const changeLanguage = useCallback((lang: LanguageCode) => {
        dispatch({ type: 'CHANGE_LANGUAGE', payload: lang });

        // Restart recognition if currently listening
        if (state.isListening) {
            stopListening();
            setTimeout(() => {
                startListening({ lang });
            }, 300);
        }
    }, [state.isListening, startListening, stopListening]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            cleanupRecognition();
        };
    }, [cleanupRecognition]);

    return {
        isListening: state.isListening,
        transcript: state.transcript,
        finalTranscript: state.finalTranscript,
        interimTranscript: state.interimTranscript,
        error: state.error,
        isSupported,
        utterances: state.utterances,
        currentLanguage: state.currentLanguage,
        startListening,
        stopListening,
        resetTranscript,
        clearUtterances,
        changeLanguage
    };
};

interface MicButtonProps {
    isListening: boolean;
    onStart: () => void;
    onStop: () => void;
    disabled?: boolean;
}
export const MicButton = ({ isListening, onStart, onStop, disabled }: MicButtonProps) => {
    return (
        <Button
            onClick={isListening ? onStop : onStart}
            variant="ghost"
            disabled={disabled}
            className={cn(
                "relative rounded-full cursor-pointer size-12 md:size-15 flex items-center justify-center overflow-hidden",
                disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            )}
            aria-label={isListening ? "Stop" : "Start"}
        >
            {/* グラデーション背景 */}
            <div
                className={cn(
                    "absolute inset-0",
                    isListening
                        ? "bg-gradient-to-br from-red-400 via-red-500 to-red-600 animate-pulse"
                        : "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300",
                    !disabled && !isListening && "hover:from-gray-200 hover:via-gray-300 hover:to-gray-400",
                    !disabled && isListening && "hover:from-red-500 hover:via-red-600 hover:to-red-700"
                )}
            />

            {/* ホバーエフェクト用のトランジション - pulse と分離 */}
            <div
                className={cn(
                    "absolute inset-0 opacity-0 transition-opacity duration-300",
                    !disabled && "hover:opacity-100"
                )}
            />

            {/* アイコン */}
            {isListening ? (
                <MicOffIcon className="relative z-10 size-5 md:size-6 text-white" />
            ) : (
                <MicIcon className="relative z-10 size-5 md:size-6 text-gray-700" />
            )}
        </Button>
    );
};