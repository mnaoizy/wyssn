"use client";

import { SpeechRecognitionContainer, SpeechRecognitionProps } from './speech-recognition-container';

/**
 * Main Speech Recognition component
 * This is a wrapper around the container component to maintain backward compatibility
 * with the existing imports throughout the application.
 */
export const SpeechRecognition: React.FC<SpeechRecognitionProps> = (props) => {
    return <SpeechRecognitionContainer {...props} />;
};

// Export types and props from the container to maintain type compatibility
export type { SpeechRecognitionProps } from './speech-recognition-container';
