import { createI18nServer } from 'next-international/server'

export const {
    getI18n,
    getScopedI18n,
    getStaticParams,
    getCurrentLocale
} = createI18nServer({
    "en-US": () => import('./en-US'),
    "fr-FR": () => import('./fr-FR'),
    "de-DE": () => import('./de-DE'),
    "ja-JP": () => import('./ja-JP'),
    "zh-CN": () => import('./zh-CN'),
    "zh-TW": () => import('./zh-TW')
})
