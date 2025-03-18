"use client";

import React, { useEffect, useState } from 'react';
import { useSpeechRecognition, LanguageSelector, MicButton } from '@/hooks/use-speech-recognition';

export const SpeechRecognitionMinimal = () => {
    // Add client-side only initialization
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const {
        isListening,
        utterances,
        error,
        isSupported,
        currentLanguage,
        startListening,
        stopListening,
        changeLanguage
    } = useSpeechRecognition({
        continuous: true,
        interimResults: true,
        onFinalUtterance(utterance, allUtterances) {
            console.log('Final utterance:', utterance);
            console.log('All utterances:', allUtterances);
        },
    });

    // Don't render anything until client-side
    if (!mounted) {
        return <div className="p-4 border rounded-lg shadow-sm">
            <div className="mt-3 p-3 bg-gray-50 rounded min-h-[80px] text-sm">
                Loading speech recognition...
            </div>
        </div>;
    }

    return (
        <div className="p-4 border rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <LanguageSelector
                    value={currentLanguage}
                    onChange={changeLanguage}
                    disabled={!isSupported}
                />
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
                    お使いのブラウザは音声認識をサポートしていません。
                </div>
            )}

            <div className="mt-3 p-3 bg-gray-50 rounded min-h-[80px] text-sm">
                {utterances.map(u => u.text).join("") || 'マイクボタンをクリックして話してください...'}
            </div>
        </div>
    );
};
