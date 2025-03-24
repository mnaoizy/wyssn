'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';

type AddContextType = {
    contextValue: string;
    setContextValue: (context: string) => void;
};

const AddContextContext = createContext<AddContextType | undefined>(undefined);

export const AddContextProvider: React.FC<{
    children: ReactNode;
    initialContext?: string;
}> = ({ children, initialContext = '' }) => {
    const [contextValue, setContextValue] = useState<string>(initialContext);

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
