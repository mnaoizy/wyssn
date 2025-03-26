'use client'

import { I18nClient, useI18n } from '@/locale/client'
import { Skeleton } from '@/components/ui/skeleton'
import { LanguageSelector } from '@/components/language-selector'
import {
    RegisterLink,
    LoginLink,
    LogoutLink,
} from '@kinde-oss/kinde-auth-nextjs/components'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import { MobileMenuButton } from '@/components/mobile-menu-button'
import { AdminLink } from '@/components/admin-link'

interface NavigationProps {
    locale: string
}

function LogoContent({ locale }: { locale: string }) {
    return (
        <>
            <Link
                href={`/${locale}`}
                className="font-serif text-lg font-semibold tracking-tighter select-none uppercase"
            >
                Wyssn
            </Link>
            <span className="text-xs text-neutral-500 font-mono mt-1 select-none hidden sm:inline">
                /wɪzn/
            </span>
        </>
    )
}

function LogoLoading() {
    return (
        <>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-3 w-12 hidden sm:block" />
        </>
    )
}

function DesktopNavContent({ locale, t, isAuthenticated }: {
    locale: string;
    t: I18nClient;
    isAuthenticated: boolean
}) {
    return (
        <>
            <LanguageSelector />
            <div className="flex items-center space-x-4 text-sm">
                <AdminLink />
                <Link
                    href={`/${locale}/changelog`}
                    className="hover:text-neutral-500 transition-colors"
                >
                    {t('nav.changelog')}
                </Link>
                {!isAuthenticated && (
                    <Link
                        href={`/${locale}/pricing`}
                        className="hover:text-neutral-500 transition-colors"
                    >
                        {t('nav.pricing')}
                    </Link>
                )}
            </div>
        </>
    )
}

function DesktopNavLoading() {
    return (
        <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
        </div>
    )
}

function AuthButtonsContent({ locale, t, isAuthenticated }: {
    locale: string;
    t: I18nClient;
    isAuthenticated: boolean
}) {
    return isAuthenticated ? (
        <>
            <Link
                href={`/${locale}/account`}
                className={buttonVariants({
                    variant: 'default',
                    size: 'sm',
                })}
            >
                {t('nav.account')}
            </Link>
            <LogoutLink
                postLogoutRedirectURL={`${process.env.NEXT_PUBLIC_APP_URL}/?signout=true`}
                className={buttonVariants({
                    variant: 'outline',
                    size: 'sm',
                })}
            >
                {t('nav.signout')}
            </LogoutLink>
        </>
    ) : (
        <>
            <RegisterLink
                authUrlParams={{ lang: locale }}
                lang={locale}
                postLoginRedirectURL={`${process.env.NEXT_PUBLIC_APP_URL}/${locale}/?register=true`}
                className={buttonVariants({
                    variant: 'default',
                    size: 'sm',
                })}
            >
                {t('nav.signup')}
            </RegisterLink>
            <LoginLink
                authUrlParams={{ lang: locale }}
                postLoginRedirectURL={`${process.env.NEXT_PUBLIC_APP_URL}/${locale}/?signin=true`}
                className={buttonVariants({
                    variant: 'outline',
                    size: 'sm',
                })}
            >
                {t('nav.signin')}
            </LoginLink>
        </>
    )
}

function AuthButtonsLoading() {
    return (
        <div className="flex space-x-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
        </div>
    )
}

function MobileNavContent() {
    return (
        <>
            <LanguageSelector />
            <MobileMenuButton />
        </>
    )
}

function MobileNavLoading() {
    return (
        <>
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-md" />
        </>
    )
}

export function Navigation({ locale }: NavigationProps) {
    const t = useI18n()
    const { isAuthenticated, isLoading } = useKindeBrowserClient()

    return (
        <nav className="border-b border-neutral-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-2xl">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-2">
                        {isLoading ? <LogoLoading /> : <LogoContent locale={locale} />}
                    </div>

                    {/* Desktop Navigation */}
                    <div
                        className="hidden md:flex items-center justify-end space-x-4 flex-1"
                        data-testid="desktop-nav"
                    >
                        {isLoading ? (
                            <DesktopNavLoading />
                        ) : (
                            <DesktopNavContent locale={locale} t={t} isAuthenticated={isAuthenticated} />
                        )}
                        {isLoading ? (
                            <AuthButtonsLoading />
                        ) : (
                            <AuthButtonsContent locale={locale} t={t} isAuthenticated={isAuthenticated} />
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div
                    className="flex md:hidden items-center space-x-4"
                    data-testid="mobile-nav"
                >
                    {isLoading ? <MobileNavLoading /> : <MobileNavContent />}
                </div>
            </div>
        </nav>
    )
}
