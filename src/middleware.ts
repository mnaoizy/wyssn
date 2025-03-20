import { createI18nMiddleware } from 'next-international/middleware'
import { NextRequest } from 'next/server'
import { defaultLocale, locales } from '@/locale/config'


const I18nMiddleware = createI18nMiddleware({
    locales: locales,
    defaultLocale,
})

export function middleware(request: NextRequest) {
    return I18nMiddleware(request)
}

export const config = {
    matcher: ['/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)']
}