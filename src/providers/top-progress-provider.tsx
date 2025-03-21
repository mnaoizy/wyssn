"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { ReactNode } from "react";

export const TopProgressBarProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    return (
        <>
            {children}
            <ProgressProvider
                height="4px"
                color="#000000"
                options={{ showSpinner: false }}
                shallowRouting
            />
        </>
    );
};
