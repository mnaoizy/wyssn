'use client';

import { useReducer, useEffect, useCallback, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, Globe } from 'lucide-react';

// サポートされている言語のリスト（コード：名前 のマッピング）
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

// 言語コードの型
export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// Type definitions for the Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
    timeStamp: number;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
}

interface SpeechGrammarList {
    length: number;
    item(index: number): SpeechGrammar;
    [index: number]: SpeechGrammar;
    addFromURI(src: string, weight?: number): void;
    addFromString(string: string, weight?: number): void;
}

interface SpeechGrammar {
    src: string;
    weight: number;
}

// Utterance record for keeping track of individual speech segments
export interface Utterance {
    id: string;
    text: string;
    timestamp: number;
    confidence: number;
    isFinal: boolean;
    lang?: LanguageCode; // 言語情報を追加
}

// Speech Recognition hook type definitions
export interface SpeechRecognitionOptions {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: LanguageCode; // 型を限定
    maxAlternatives?: number;
    grammars?: SpeechGrammarList;
    shouldPersistTranscript?: boolean;
    onFinalUtterance?: (utterance: Utterance, allUtterances: Utterance[]) => void;
}

// Our custom hook result interface with utterance history
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

// SpeechRecognition API type definition
type SpeechRecognitionApi = {
    new(): SpeechRecognitionInstance;
    prototype: SpeechRecognitionInstance;
};

interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    grammars: SpeechGrammarList;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

// Browser compatibility check for SpeechRecognition
const SpeechRecognition: SpeechRecognitionApi | null = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition) as SpeechRecognitionApi
    : null;

// Generate a unique ID for each utterance
const generateId = (): string => {
    return Math.random().toString(36).substring(2, 11);
};

// 処理済みの発話IDを追跡するためのグローバルセット
const processedUtteranceIds = new Set<string>();

// Define state type for the reducer
interface SpeechRecognitionState {
    isListening: boolean;
    transcript: string;
    finalTranscript: string;
    interimTranscript: string;
    error: Error | null;
    utterances: Utterance[];
    currentLanguage: LanguageCode;
}

// Define action types for the reducer
type SpeechRecognitionAction =
    | { type: 'START_LISTENING' }
    | { type: 'STOP_LISTENING' }
    | { type: 'SET_ERROR', payload: Error }
    | { type: 'CLEAR_ERROR' }
    | { type: 'RESET_TRANSCRIPT', payload?: { keepUtterances?: boolean } }
    | { type: 'CLEAR_UTTERANCES' }
    | { type: 'CHANGE_LANGUAGE', payload: LanguageCode }
    | {
        type: 'UPDATE_RESULTS',
        payload: {
            finalText: string,
            interimText: string,
            newUtterances: Utterance[],
            persistTranscript: boolean
        }
    };

// Initial state for the reducer (デフォルト言語を日本語に設定)
const initialState: SpeechRecognitionState = {
    isListening: false,
    transcript: '',
    finalTranscript: '',
    interimTranscript: '',
    error: null,
    utterances: [],
    currentLanguage: 'ja-JP'
};

// Reducer function
function speechRecognitionReducer(state: SpeechRecognitionState, action: SpeechRecognitionAction): SpeechRecognitionState {
    switch (action.type) {
        case 'START_LISTENING':
            return {
                ...state,
                isListening: true,
                error: null
            };
        case 'STOP_LISTENING':
            return {
                ...state,
                isListening: false
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                isListening: false
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null
            };
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
            return {
                ...state,
                utterances: []
            };
        case 'CHANGE_LANGUAGE':
            return {
                ...state,
                currentLanguage: action.payload
            };
        case 'UPDATE_RESULTS': {
            const { finalText, interimText, newUtterances, persistTranscript } = action.payload;
            const updatedUtterances = persistTranscript
                ? [...state.utterances.filter(u => u.isFinal), ...newUtterances]
                : newUtterances;

            const combinedTranscript = (finalText ? finalText : '') + (interimText ? ' ' + interimText : '');

            return {
                ...state,
                transcript: combinedTranscript,
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
 * React hook for browser speech recognition API with utterance history and language selection
 * 
 * @param options - Configuration options for speech recognition
 * @returns An object containing speech recognition state, utterance history, and control functions
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

    // Clean up the speech recognition instance
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

    // Change language function
    const changeLanguage = useCallback((lang: LanguageCode) => {
        dispatch({ type: 'CHANGE_LANGUAGE', payload: lang });

        // 言語変更時に認識中なら再起動
        if (state.isListening) {
            stopListening();
            // 少し遅延を入れて、stopしてから再開する
            setTimeout(() => {
                startListening({ lang });
            }, 300);
        }
    }, [state.isListening]);

    // Start listening function
    const startListening = useCallback(
        (customOptions: SpeechRecognitionOptions = {}) => {
            if (!isSupported) {
                dispatch({ type: 'SET_ERROR', payload: new Error('Speech recognition is not supported in this browser') });
                return;
            }

            // Clean up any existing instance
            cleanupRecognition();

            try {
                // Create a new recognition instance
                const mergedOptions = {
                    ...optionsRef.current,
                    ...customOptions,
                    // カスタムオプションで言語が指定されていない場合は、現在の言語を使用
                    lang: customOptions.lang || state.currentLanguage
                };

                const recognition = new SpeechRecognition();

                // Apply options
                recognition.continuous = !!mergedOptions.continuous;
                recognition.interimResults = !!mergedOptions.interimResults;
                recognition.lang = mergedOptions.lang || state.currentLanguage; // 常に現在選択されている言語を使用
                if (mergedOptions.maxAlternatives) recognition.maxAlternatives = mergedOptions.maxAlternatives;
                if (mergedOptions.grammars) recognition.grammars = mergedOptions.grammars;

                // Check if we should persist transcript from previous sessions
                const persistTranscript = mergedOptions.shouldPersistTranscript !== false;

                // Reset transcript if not persisting
                if (!persistTranscript) {
                    dispatch({ type: 'RESET_TRANSCRIPT' });
                }

                // Set up event handlers
                recognition.onresult = (event: SpeechRecognitionEvent) => {
                    let interimText = '';
                    let finalText = persistTranscript ? state.finalTranscript : '';
                    const currentTime = event.timeStamp || Date.now();
                    const currentLang = recognition.lang as LanguageCode;

                    // Process and store new utterances
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
                                    lang: currentLang // 言語情報を追加
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
                                        lang: currentLang // 言語情報を追加
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

                    // Call onFinalUtterance callback for each new final utterance
                    const onFinalUtterance = mergedOptions.onFinalUtterance;
                    if (onFinalUtterance && typeof onFinalUtterance === 'function') {
                        const finalUtterances = newUtterances.filter(u => u.isFinal);
                        const updatedUtterances = persistTranscript
                            ? [...state.utterances.filter(u => u.isFinal), ...newUtterances]
                            : newUtterances;

                        finalUtterances.forEach(utterance => {
                            // まだ処理していないIDのみコールバックを呼び出す
                            if (!processedUtteranceIds.has(utterance.id)) {
                                processedUtteranceIds.add(utterance.id);
                                onFinalUtterance(utterance, updatedUtterances);
                            }
                        });
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
        [cleanupRecognition, isSupported, state.finalTranscript, state.utterances, state.currentLanguage]
    );

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

    // Reset transcript function
    const resetTranscript = useCallback(() => {
        dispatch({ type: 'RESET_TRANSCRIPT' });
    }, []);

    // Clear utterances only
    const clearUtterances = useCallback(() => {
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
            <SelectTrigger className="w-[180px] flex gap-2">
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
            className={`rounded-full p-3 ${isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-blue-500 text-white'} 
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
            aria-label={isListening ? "音声認識を停止" : "音声認識を開始"}
        >
            <Mic className="h-6 w-6" />
        </button>
    );
};

// 音声認識UIコンポーネント（使用例）
export const SpeechRecognitionUI = () => {
    const {
        isListening,
        transcript,
        error,
        isSupported,
        currentLanguage,
        startListening,
        stopListening,
        resetTranscript,
        changeLanguage
    } = useSpeechRecognition({
        continuous: true,
        interimResults: true
    });

    return (
        <div className="p-4 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
                <LanguageSelector
                    value={currentLanguage}
                    onChange={changeLanguage}
                    disabled={!isSupported}
                />
                <MicButton
                    isListening={isListening}
                    onStart={() => startListening()}
                    onStop={stopListening}
                    disabled={!isSupported}
                />
            </div>

            {error ? (
                <div className="text-red-500 mb-4">エラー: {error.message}</div>
            ) : null}

            {!isSupported ? (
                <div className="text-yellow-500 mb-4">
                    お使いのブラウザは音声認識をサポートしていません。Chrome などの別のブラウザをお試しください。
                </div>
            ) : null}

            <div className="mt-4">
                <h3 className="font-medium mb-2">認識結果:</h3>
                <div className="p-4 bg-gray-100 rounded min-h-[100px] whitespace-pre-wrap">
                    {transcript || 'まだ音声は認識されていません...'}
                </div>
                <button
                    onClick={resetTranscript}
                    className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    disabled={!transcript}
                >
                    結果をクリア
                </button>
            </div>
        </div>
    );
};

// Add TypeScript definitions for browser compatibility
declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionApi;
        webkitSpeechRecognition: SpeechRecognitionApi;
    }
}