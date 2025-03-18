'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { Utterance } from '@/hooks/use-speech-recognition';

type UtteranceContextType = {
    utterances: Utterance[];
    setUtterances: (utterances: Utterance[]) => void;
};

const UtteranceContext = createContext<UtteranceContextType | undefined>(undefined);

export const UtteranceProvider: React.FC<{
    children: ReactNode;
    initialUtterances?: Utterance[];
}> = ({ children, initialUtterances = [] }) => {
    const [utterances, setUtterances] = React.useState<Utterance[]>(initialUtterances);

    return (
        <UtteranceContext.Provider value={{ utterances, setUtterances }}>
            {children}
        </UtteranceContext.Provider>
    );
};

export const useUtterances = (): UtteranceContextType => {
    const context = useContext(UtteranceContext);
    if (context === undefined) {
        throw new Error('useUtterances must be used within an UtteranceProvider');
    }
    return context;
};
