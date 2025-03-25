'use client';

import { usePersistentState } from '@/hooks/use-persistent-state';
import React, { createContext, useContext, ReactNode } from 'react';

type AddContextType = {
    contextValue: string;
    setContextValue: (context: string) => void;
};

const AddContextContext = createContext<AddContextType | undefined>(undefined);

export const AddContextProvider: React.FC<{
    children: ReactNode;
    initialContext?: string;
}> = ({ children, initialContext = '' }) => {
    const [contextValue, setContextValue] = usePersistentState<string>(initialContext, "") ;

    return (
        <AddContextContext.Provider value={{ contextValue, setContextValue }}>
            {children}
        </AddContextContext.Provider>
    );
};

export const useAddContext = (): AddContextType => {
    const context = useContext(AddContextContext);
    if (context === undefined) {
        throw new Error('useAddContext must be used within an AddContextProvider');
    }
    return context;
};
