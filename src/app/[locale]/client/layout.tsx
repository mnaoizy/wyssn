"use client";

import { I18nProviderClient } from "@/locale/client";
import { ReactElement, use } from "react";

export default function SubLayout({
    children,
    params,
}: {
    children: ReactElement;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = use(params);

    if (!locale) {
        return null;
    }

    return (
        <I18nProviderClient locale={locale} fallback={null}>
            {children}
        </I18nProviderClient>
    );
}