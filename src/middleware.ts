import { createI18nMiddleware } from 'next-international/middleware'
import { NextRequest } from 'next/server'
import { defaultLocale, locales } from '@/locale/config'

// ロケールの型を定義
type Locale = typeof locales[number];

/**
 * Accept-Languageヘッダーからロケールを解決する関数
 */
function resolveLocaleFromAcceptLanguage(
    acceptLanguage: string,
    supportedLocales: readonly string[],
    defaultLocale: Locale
): Locale {
    try {
        if (!acceptLanguage) return defaultLocale

        // Accept-Language形式の解析: 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7'
        const preferredLocales = acceptLanguage
            .split(',')
            .map(item => {
                const [locale, qualityStr] = item.trim().split(';q=')
                const quality = qualityStr ? parseFloat(qualityStr) : 1.0
                return { locale, quality }
            })
            .sort((a, b) => b.quality - a.quality)

        // 完全一致するロケールを探す (例: ja-JP)
        for (const { locale } of preferredLocales) {
            if (supportedLocales.includes(locale)) {
                return locale as Locale
            }

            // 完全一致がない場合は、言語コードのみの一致も確認 (例: ja)
            const langCode = locale.split('-')[0]
            const matchByLangCode = supportedLocales.find(supported =>
                supported.startsWith(langCode + '-') || supported === langCode
            )

            if (matchByLangCode) {
                return matchByLangCode as Locale
            }
        }

        return defaultLocale
    } catch (error) {
        console.error('Error resolving locale from Accept-Language:', error)
        return defaultLocale
    }
}

const I18nMiddleware = createI18nMiddleware({
    locales: locales,
    defaultLocale,
    resolveLocaleFromRequest: (request) => {
        // 1. まず、Cookieからロケールを取得してみる
        const cookieLocale = request.cookies.get('Next-Locale')?.value as Locale | undefined

        // Cookieがあり、サポートされているロケールなら、それを返す
        if (cookieLocale && locales.includes(cookieLocale)) {
            return cookieLocale
        }

        // 2. Cookieがない場合は、Accept-Languageヘッダーからロケールを解決
        const acceptLanguage = request.headers.get('accept-language') || ''
        return resolveLocaleFromAcceptLanguage(acceptLanguage, locales, defaultLocale)
    }
})

export function middleware(request: NextRequest) {
    return I18nMiddleware(request)
}

export const config = {
    matcher: ['/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)']
}