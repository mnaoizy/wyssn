"use client";

import React, { useEffect, useState } from 'react';
import { useSpeechRecognition, LanguageSelector, MicButton } from '@/hooks/use-speech-recognition';
import { Button } from '@/components/ui/button';
import { useUtterances } from '@/contexts/utterance-context';
import { useI18n } from '@/locale/client';

export const SpeechRecognitionMinimal = () => {
    // Add client-side only initialization
    const [mounted, setMounted] = useState(false);
    // Get utterances from context instead of just from the hook
    const { utterances: contextUtterances, setUtterances } = useUtterances();
    // Add state for displaying interim text
    const [interimText, setInterimText] = useState('');

    const t = useI18n();

    useEffect(() => {
        setMounted(true);
    }, []);

    const {
        isListening,
        error,
        isSupported,
        currentLanguage,
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

    // Don't render anything until client-side
    if (!mounted) {
        return <div className="w-full p-4 border rounded-lg shadow-sm">
            <div className="mt-3 p-3 bg-gray-50 rounded min-h-[80px] text-sm flex items-center justify-center text-gray-400">
                Loading speech recognition...
            </div>
        </div>;
    }

    return (
        <div className="w-full max-w-full p-4 border rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className='flex flex-row gap-2 flex-wrap'>
                    <LanguageSelector
                        value={currentLanguage}
                        onChange={changeLanguage}
                        disabled={!isSupported}
                    />
                    <Button variant="outline">Add Context</Button>
                </div>

                <MicButton
                    isListening={isListening}
                    onStart={startListening}
                    onStop={stopListening}
                    disabled={!isSupported}
                />
            </div>

            {error && (
                <div className="text-red-500 text-sm mb-2">
                    {error.message}
                </div>
            )}

            {!isSupported && (
                <div className="text-yellow-500 text-sm mb-2">
                    Your browser does not support speech recognition.
                </div>
            )}

            <div className="text-sm text-gray-500">
                <div className="max-h-60 overflow-auto p-3 bg-gray-50 rounded">
                    {finalUtterances.length > 0 || interimText ? (
                        <div className="whitespace-pre-wrap">
                            {/* Concatenate finalized utterances with spaces */}
                            <span>
                                {finalUtterances.map(u => u.text).join(' ')}
                            </span>

                            {/* Display the latest interim utterance with a pulse effect */}
                            {interimText && (
                                <span className="ml-1 text-gray-400 animate-pulse">
                                    {interimText}
                                </span>
                            )}

                            {finalUtterances.length === 0 && !interimText && (
                                <span className="text-gray-400">
                                    {t("main.prompt_speak")}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            {t("main.prompt_speak")}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};