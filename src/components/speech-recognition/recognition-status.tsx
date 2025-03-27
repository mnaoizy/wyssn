"use client";

import React, { useEffect } from 'react';
import toast from 'react-hot-toast';

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

    useEffect(() => {
        if (error) {
            const errorType = error.message.startsWith('Error: ')
                ? error.message.substring(7)
                : error.message;

            switch (errorType) {
                case 'no-speech':
                    toast.error('No speech was detected', {
                        duration: 2000,
                        id: 'no-speech-toast'
                    });
                    break;
                case 'aborted':
                    toast.error('Speech recognition was aborted', {
                        duration: 2000,
                        id: 'aborted-toast'
                    });
                    break;
                case 'audio-capture':
                    toast.error('Audio capture failed', {
                        duration: 2000,
                        id: 'audio-capture-toast'
                    });
                    break;
                case 'network':
                    toast.error('Network communication failed', {
                        duration: 2000,
                        id: 'network-toast'
                    });
                    break;
                case 'not-allowed':
                    toast.error('Microphone access not allowed', {
                        duration: 2000,
                        id: 'not-allowed-toast'
                    });
                    break;
                case 'service-not-allowed':
                    toast.error('Speech recognition service not allowed', {
                        duration: 2000,
                        id: 'service-not-allowed-toast'
                    });
                    break;
                case 'bad-grammar':
                    toast.error('Invalid grammar format', {
                        duration: 2000,
                        id: 'bad-grammar-toast'
                    });
                    break;
                case 'language-not-supported':
                    toast.error('Language not supported', {
                        duration: 2000,
                        id: 'language-not-supported-toast'
                    });
                    break;
                default:
                    toast.error(error.message, {
                        duration: 2000,
                        id: 'speech-error-toast'
                    });
            }
        }

        if (!isSupported) {
            toast.error('Browser does not support speech recognition', {
                duration: 2000,
                id: 'browser-not-supported-toast'
            });
        }
    }, [error, isSupported]);

    return null;
};
