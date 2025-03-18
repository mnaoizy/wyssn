import { useReducer, useEffect, useCallback, useRef } from 'react';

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
}

// Speech Recognition hook type definitions
export interface SpeechRecognitionOptions {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
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
    startListening: (options?: SpeechRecognitionOptions) => void;
    stopListening: () => void;
    resetTranscript: () => void;
    clearUtterances: () => void;
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
}

// Define action types for the reducer
type SpeechRecognitionAction =
    | { type: 'START_LISTENING' }
    | { type: 'STOP_LISTENING' }
    | { type: 'SET_ERROR', payload: Error }
    | { type: 'CLEAR_ERROR' }
    | { type: 'RESET_TRANSCRIPT', payload?: { keepUtterances?: boolean } }
    | { type: 'CLEAR_UTTERANCES' }
    | {
        type: 'UPDATE_RESULTS',
        payload: {
            finalText: string,
            interimText: string,
            newUtterances: Utterance[],
            persistTranscript: boolean
        }
    };

// Initial state for the reducer
const initialState: SpeechRecognitionState = {
    isListening: false,
    transcript: '',
    finalTranscript: '',
    interimTranscript: '',
    error: null,
    utterances: []
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
 * React hook for browser speech recognition API with utterance history
 * 
 * @param options - Configuration options for speech recognition
 * @returns An object containing speech recognition state, utterance history, and control functions
 */
export const useSpeechRecognition = (
    options: SpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {
    const [state, dispatch] = useReducer(speechRecognitionReducer, initialState);
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
                const mergedOptions = { ...optionsRef.current, ...customOptions };
                const recognition = new SpeechRecognition();

                // Apply options
                recognition.continuous = !!mergedOptions.continuous;
                recognition.interimResults = !!mergedOptions.interimResults;
                if (mergedOptions.lang) recognition.lang = mergedOptions.lang;
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

                    // Process and store new utterances
                    const newUtterances: Utterance[] = [];

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const result = event.results[i];
                        const transcriptText = result[0].transcript.trim();
                        const confidence = result[0].confidence;

                        if (transcriptText) {
                            if (result.isFinal) {
                                finalText += (finalText ? ' ' : '') + transcriptText;

                                // Add final utterance
                                newUtterances.push({
                                    id: generateId(),
                                    text: transcriptText,
                                    timestamp: currentTime,
                                    confidence: confidence,
                                    isFinal: true
                                });
                            } else {
                                interimText += transcriptText;

                                // Add interim utterance
                                if (mergedOptions.interimResults) {
                                    newUtterances.push({
                                        id: generateId(),
                                        text: transcriptText,
                                        timestamp: currentTime,
                                        confidence: confidence,
                                        isFinal: false
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
        [cleanupRecognition, isSupported, state.finalTranscript, state.utterances]
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
        startListening,
        stopListening,
        resetTranscript,
        clearUtterances,
    };
};

// Add TypeScript definitions for browser compatibility
declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionApi;
        webkitSpeechRecognition: SpeechRecognitionApi;
    }
}