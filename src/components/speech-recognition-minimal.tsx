"use client";

import React, { useEffect, useState } from 'react';
import { useSpeechRecognition, LanguageSelector, MicButton } from '@/hooks/use-speech-recognition';
import { Button } from './ui/button';
import { useUtterances } from '@/contexts/utterance-context';

export const SpeechRecognitionMinimal = () => {
    // Add client-side only initialization
    const [mounted, setMounted] = useState(false);
    // Get utterances from context instead of just from the hook
    const { utterances: contextUtterances, setUtterances } = useUtterances();

    useEffect(() => {
        setMounted(true);
    }, []);

    const {
        isListening,
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
            setUtterances(allUtterances);
        },
    });

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
                    <Button variant="outline">コンテクストを追加</Button>
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
                    お使いのブラウザは音声認識をサポートしていません。
                </div>
            )}

            <div className="text-sm text-gray-500">
                {contextUtterances.map(u => u.text.trim()).join("") || 'マイクボタンをクリックして話してください...'}
            </div>
        </div>
    );
};
