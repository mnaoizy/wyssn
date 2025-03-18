"use client"

import { useChangeLocale, useCurrentLocale } from "@/locale/client"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Globe } from "lucide-react"
import { Suspense } from "react"

const SUPPORTED_LOCALES = {
    en: "English",
    fr: "Français",
    ja: "日本語"
} as const

type Locale = keyof typeof SUPPORTED_LOCALES

function LanguageSelectorInner() {
    const changeLocale = useChangeLocale({ preserveSearchParams: true })
    const currentLocale = useCurrentLocale()

    return (
        <Select
            value={currentLocale}
            onValueChange={(value: Locale) => changeLocale(value)}
        >
            <SelectTrigger className="w-[130px] flex gap-2">
                <Globe className="h-4 w-4" />
                <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
                {Object.entries(SUPPORTED_LOCALES).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                        {name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export function LanguageSelector() {
    return (
        <Suspense fallback={<div className="w-[130px] h-9 bg-neutral-100 animate-pulse rounded-md" />}>
            <LanguageSelectorInner />
        </Suspense>
    )
}
