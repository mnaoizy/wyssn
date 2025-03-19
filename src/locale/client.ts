import { createI18nClient } from 'next-international/client'

export const {
    useI18n,
    useScopedI18n,
    I18nProviderClient,
    useChangeLocale,
    useCurrentLocale
} = createI18nClient({
    "en-US": () => import('./en-US'),
    "fr-FR": () => import('./fr-FR'),
    "ja-JP": () => import('./ja-JP'),
    "zh-CN": () => import('./zh-CN'),
    "zh-TW": () => import('./zh-TW')
})
