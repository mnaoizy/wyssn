'use client';

import { useReducer, useEffect, useCallback, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, Globe } from 'lucide-react';

// サポートされている言語のリスト
export const SUPPORTED_LANGUAGES = {
    'en-US': '英語（アメリカ）',
    'zh-CN': '中国語（簡体 / 普通話）',
    'zh-TW': '中国語（繁体 / 台湾華語）',
    'zh-HK': '広東語（香港）',
    'es-ES': 'スペイン語（スペイン）',
    'fr-FR': 'フランス語（フランス）',
    'de-DE': 'ドイツ語',
    'pt-PT': 'ポルトガル語（ポルトガル）',
    'pt-BR': 'ポルトガル語（ブラジル）',
    'ru-RU': 'ロシア語',
    'ja-JP': '日本語',
    'ko-KR': '韓国語',
    'it-IT': 'イタリア語',
    'ar-SA': 'アラビア語（サウジアラビア）',
    'hi-IN': 'ヒンディー語（インド）',
    'bn-IN': 'ベンガル語（インド）',
    'tr-TR': 'トルコ語',
    'id-ID': 'インドネシア語',
    'th-TH': 'タイ語',
    'vi-VN': 'ベトナム語'
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

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
    currentLanguage: 'ja-JP'
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
                transcript: (finalText || '') + (interimText ? ' ' + interimText : ''),
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

    // Change language
    const changeLanguage = useCallback((lang: LanguageCode) => {
        dispatch({ type: 'CHANGE_LANGUAGE', payload: lang });

        // Restart recognition if currently listening
        if (state.isListening) {
            stopListening();
            setTimeout(() => {
                startListening({ lang });
            }, 300);
        }
    }, [state.isListening]);

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
                                finalText += (finalText ? ' ' : '') + transcriptText;

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
                                interimText += transcriptText;

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
        [cleanupRecognition, isSupported, state.finalTranscript, state.utterances, state.currentLanguage, stopListening]
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

// 言語選択コンポーネント
interface LanguageSelectorProps {
    value: LanguageCode;
    onChange: (language: LanguageCode) => void;
    disabled?: boolean;
}

export const LanguageSelector = ({ value, onChange, disabled }: LanguageSelectorProps) => {
    return (
        <Select
            value={value}
            onValueChange={(value: LanguageCode) => onChange(value)}
            disabled={disabled}
        >
            <SelectTrigger className="flex gap-2">
                <Globe className="h-4 w-4" />
                <SelectValue placeholder="言語を選択" />
            </SelectTrigger>
            <SelectContent>
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                        {name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

// マイクボタンコンポーネント
interface MicButtonProps {
    isListening: boolean;
    onStart: () => void;
    onStop: () => void;
    disabled?: boolean;
}

export const MicButton = ({ isListening, onStart, onStop, disabled }: MicButtonProps) => {
    return (
        <button
            onClick={isListening ? onStop : onStart}
            disabled={disabled}
            className={`rounded-full cursor-pointer p-3 ${isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-700 text-white'} 
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
            aria-label={isListening ? "音声認識を停止" : "音声認識を開始"}
        >
            <Mic className="h-6 w-6" />
        </button>
    );
};
