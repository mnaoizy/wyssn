"use client";

import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface RecognitionStatusProps {
    error: Error | null;
    isSupported: boolean;
}

/**
 * Component to display the status of speech recognition, including errors and support status
 * Enhanced with a monochrome design and improved visual feedback
 */
export const RecognitionStatus: React.FC<RecognitionStatusProps> = ({
    error,
    isSupported
}) => {
    if (!error && isSupported) {
        return null;
    }

    return (
        <div className="font-mono">
            {error && (
                <div className="flex items-center gap-2 border border-gray-300 bg-gray-50 p-3 rounded-md mb-3 shadow-sm">
                    <AlertCircle className="h-5 w-5 text-gray-700" />
                    <span className="text-gray-800 text-sm">
                        {error.message}
                    </span>
                </div>
            )}

            {!isSupported && (
                <div className="flex items-center gap-2 border border-gray-300 bg-gray-50 p-3 rounded-md mb-3 shadow-sm">
                    <AlertTriangle className="h-5 w-5 text-gray-700" />
                    <span className="text-gray-800 text-sm">
                        Your browser does not support speech recognition.
                    </span>
                </div>
            )}
        </div>
    );
};