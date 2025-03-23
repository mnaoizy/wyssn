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
        <div className="whitespace-normal text-xl font-bold min-h-[2em] text-left">
            {hasContent ? (
                <div className="break-all md:break-words flex flex-wrap gap-1">
                    {finalUtterances.map((utterance) => (
                        <span
                            key={utterance.id}
                            className="inline-block"
                        >
                            {utterance.text}
                        </span>
                    ))}

                    {interimText && (
                        <span className="text-gray-400">
                            {interimText}
                        </span>
                    )}
                </div>
            ) : (
                <span className="text-gray-400">
                    {t("main.prompt_speak")}
                </span>
            )}
        </div>
    );
};