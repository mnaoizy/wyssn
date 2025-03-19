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
    // 表示用の状態を追加
    const [interimText, setInterimText] = useState('');

    const t = useI18n()

    useEffect(() => {
        setMounted(true);
    }, []);

    const {
        isListening,
        error,
        isSupported,
        currentLanguage,
        utterances: speechUtterances,
        interimTranscript, // 現在の暫定的な文字起こしを取得
        startListening,
        stopListening,
        changeLanguage
    } = useSpeechRecognition({
        continuous: true,
        shouldPersistTranscript: true,
        interimResults: true,
        onFinalUtterance(utterance, allUtterances) {
            // すべての発話を保持するが、表示は制御する
            setUtterances(allUtterances);
            console.log('allUtterances:', allUtterances);
            // 暫定的な文字起こしをクリア（確定したため）
            setInterimText('');
        },
    });

    // 暫定的な文字起こしを更新
    useEffect(() => {
        if (interimTranscript) {
            setInterimText(interimTranscript);
        }
    }, [interimTranscript]);

    // フックの発話履歴をコンテキストに反映する補助的なuseEffect
    useEffect(() => {
        if (speechUtterances.length > 0) {
            const existingIds = new Set(contextUtterances.map(u => u.id));
            const newUtterances = speechUtterances.filter(u => !existingIds.has(u.id));

            if (newUtterances.length > 0) {
                setUtterances([...contextUtterances, ...newUtterances]);
            }
        }
    }, [speechUtterances, contextUtterances, setUtterances]);

    // 確定済みの発話のみを取得
    const finalUtterances = contextUtterances
        .filter(u => u.isFinal)
        .sort((a, b) => a.timestamp - b.timestamp); // タイムスタンプで古い順にソート
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
                <div className="max-h-60 overflow-auto p-3 bg-gray-50 rounded">
                    {finalUtterances.length > 0 || interimText ? (
                        <div className="whitespace-pre-wrap">
                            {/* 確定済みの発話をスペースを入れて連結 */}
                            <span>
                                {finalUtterances.map(u => u.text).join(' ')}
                            </span>

                            {/* 最新の暫定的な発話をパルスエフェクトで表示 */}
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