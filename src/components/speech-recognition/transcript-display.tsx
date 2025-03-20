"use client";

import React from 'react';
import { useI18n } from '@/locale/client';
import { Utterance } from '@/hooks/use-speech-recognition';

interface TranscriptDisplayProps {
    finalUtterances: Utterance[];
    interimText: string;
}

/**
 * Component to display speech recognition transcripts, including final utterances and interim text
 */
export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
    finalUtterances,
    interimText
}) => {
    const t = useI18n();
    const hasContent = finalUtterances.length > 0 || interimText;

    return (
        <div className="text-sm text-gray-500">
            <div className="max-h-60 overflow-auto p-3 bg-gray-50 rounded">
                {hasContent ? (
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
    );
};
