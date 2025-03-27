"use client";

import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useI18n } from '@/locale/client';

interface RecognitionStatusProps {
    error: Error | null;
    isSupported: boolean;
}

/**
 * Component to handle speech recognition status notifications
 * Uses react-hot-toast to display error messages with i18n support
 */
export const RecognitionStatus: React.FC<RecognitionStatusProps> = ({
    error,
    isSupported
}) => {
    const t = useI18n();

    useEffect(() => {
        if (error) {
            const errorType = error.message.startsWith('Error: ')
                ? error.message.substring(7)
                : error.message;

            let message;
            switch (errorType) {
                case 'no-speech':
                    message = t('speech_recognition.no_speech');
                    break;
                case 'aborted':
                    message = t('speech_recognition.aborted');
                    break;
                case 'audio-capture':
                    message = t('speech_recognition.audio_capture');
                    break;
                case 'network':
                    message = t('speech_recognition.network');
                    break;
                case 'not-allowed':
                    message = t('speech_recognition.not_allowed');
                    break;
                case 'service-not-allowed':
                    message = t('speech_recognition.service_not_allowed');
                    break;
                case 'bad-grammar':
                    message = t('speech_recognition.bad_grammar');
                    break;
                case 'language-not-supported':
                    message = t('speech_recognition.language_not_supported');
                    break;
                default:
                    message = error.message;
            }

            toast.error(message);
        }

        if (!isSupported) {
            toast.error(t('speech_recognition.browser_not_supported'));
        }
    }, [error, isSupported, t]);

    return null;
};
