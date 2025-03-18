import { createI18nMiddleware } from 'next-international/middleware'
import { NextRequest, NextResponse } from 'next/server'

const locales = ['en', 'fr', 'ja']
const defaultLocale = 'en'

const I18nMiddleware = createI18nMiddleware({
    locales,
    defaultLocale
})

export function middleware(request: NextRequest) {
    // Check if this is the root path with no locale
    const pathname = request.nextUrl.pathname

    if (pathname === '/') {
        // Get preferred locale from Accept-Language header
        const acceptLanguage = request.headers.get('accept-language') || ''
        const preferredLocale = getPreferredLocale(acceptLanguage, locales, defaultLocale)

        // Redirect to the preferred locale
        const url = new URL(`/${preferredLocale}`, request.url)
        return NextResponse.redirect(url)
    }

    return I18nMiddleware(request)
}

// Function to get preferred locale from Accept-Language header
function getPreferredLocale(acceptLanguage: string, supportedLocales: string[], defaultLocale: string): string {
    // Parse Accept-Language - example format: 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
    try {
        const preferredLocales = acceptLanguage
            .split(',')
            .map(item => {
                const [locale, qualityStr] = item.trim().split(';q=')
                const quality = qualityStr ? parseFloat(qualityStr) : 1.0
                return { locale: locale.split('-')[0], quality } // Get base language (fr from fr-FR)
            })
            .sort((a, b) => b.quality - a.quality) // Sort by quality (highest first)

        // Find the first supported locale
        for (const { locale } of preferredLocales) {
            if (supportedLocales.includes(locale)) {
                return locale
            }
        }
    } catch (error) {
        console.error('Error parsing Accept-Language header:', error)
    }

    return defaultLocale
}

export const config = {
    matcher: ['/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)']
}
