'use client'

import { I18nProviderClient, useI18n } from '@/locale/client'
import { AuthProvider } from '@/providers/auth-provider'
import { AddContextProvider } from '@/contexts/add-context-provider'
import { ReactElement, use, useEffect, useRef } from 'react'
import { LanguageSelector } from '@/components/language-selector'
import { Menu } from 'lucide-react'
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from '@kinde-oss/kinde-auth-nextjs/components'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import {
  useMobileNavigation,
  MobileNavigationPanel,
} from '@/components/mobile-navigation'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'

// Mobile menu button component
function MobileMenuButton() {
  const { toggleMenu } = useMobileNavigation()

  return (
    <button
      className="text-neutral-500 hover:text-neutral-700"
      aria-label="Menu"
      onClick={toggleMenu}
    >
      <Menu className="h-6 w-6" />
    </button>
  )
}

// Separate component that uses the I18n context
function LayoutContent({
  children,
  locale,
}: {
  children: ReactElement
  locale: string
}) {
  const t = useI18n()
  const { isAuthenticated } = useKindeBrowserClient()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const toastShownRef = useRef(false)

  useEffect(() => {
    // URLパラメータの取得
    const signout = searchParams.get('signout')
    const signin = searchParams.get('signin')
    const register = searchParams.get('register')

    // いずれかのパラメータが存在する場合
    const hasAuthParams =
      signout === 'true' || signin === 'true' || register === 'true'

    if (hasAuthParams && !toastShownRef.current) {
      // トーストを表示
      if (signout === 'true') {
        toast.success(t('nav.signout_success'), {
          duration: 2000,
          id: 'signout-toast',
        })
      } else if (signin === 'true') {
        toast.success(t('nav.signin_success'), {
          duration: 2000,
          id: 'signin-toast',
        })
      } else if (register === 'true') {
        toast.success(t('nav.register_success'), {
          duration: 2000,
          id: 'register-toast',
        })
      }

      // トースト表示済みフラグを設定
      toastShownRef.current = true

      // URLからパラメータを削除（履歴を書き換え）
      // 現在のURLから認証関連パラメータを削除した新しいURLを作成
      const newUrl = pathname
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, t, pathname, router])

  return (
    <div className="font-sans flex flex-col min-h-screen">
      {/* Mobile Navigation Panel */}
      <MobileNavigationPanel />

      {/* Navigation */}
      <nav className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-2xl">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}`}
                className="font-serif text-lg font-semibold tracking-tighter select-none uppercase"
              >
                Wyssn
              </Link>
              <span className="text-xs text-neutral-500 font-mono mt-1 select-none hidden sm:inline">
                /wɪzn/
              </span>
            </div>

            {/* Desktop Navigation */}
            <div
              className="hidden md:flex items-center justify-end space-x-4 flex-1"
              data-testid="desktop-nav"
            >
              <LanguageSelector />
              <div className="flex items-center space-x-4 text-sm">
                {/* <span>{t('nav.about')}</span> */}
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
                <div className="space-x-2">
                  {isAuthenticated ? (
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
                        postLogoutRedirectURL={`${process.env.NEXT_PUBLIC_APP_URL}/${locale}/?signout=true`}
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
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div
              className="flex md:hidden items-center space-x-4"
              data-testid="mobile-nav"
            >
              <LanguageSelector />
              <MobileMenuButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {children}

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-6 sm:py-8 bg-neutral-50 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-2xl">
          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-4">
            <span className="font-serif text-neutral-800 font-medium uppercase text-sm order-1 md:order-none">
              wyssn
            </span>

            <div className="flex gap-4 sm:gap-8 text-xs sm:text-sm text-neutral-400 order-3 md:order-none">
              <Link
                href={`/${locale}/privacy-policy`}
                className="hover:text-neutral-500 transition-colors"
              >
                {t('footer.privacy')}
              </Link>
              <Link
                href={`/${locale}/terms`}
                className="hover:text-neutral-500 transition-colors"
              >
                {t('footer.terms')}
              </Link>

              {locale === 'ja-JP' && (
                <Link
                  href={`/${locale}/commercial`}
                  className="hover:text-neutral-500 transition-colors"
                >
                  特定商取引法に基づく表記
                </Link>
              )}
              <span className="cursor-default">{t('footer.contact')}</span>
              <Link
                href={`/${locale}/changelog`}
                className="hover:text-neutral-500 transition-colors"
              >
                {t('nav.changelog')}
              </Link>
              <Link
                href={`/${locale}/pricing`}
                className="hover:text-neutral-500 transition-colors"
              >
                {t('nav.pricing')}
              </Link>
            </div>

            <div className="text-xs sm:text-sm text-neutral-500 order-2 md:order-none mb-2 md:mb-0">
              {t('footer.copyright')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function Layout({
  children,
  params,
}: {
  children: ReactElement
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)

  return (
    <I18nProviderClient locale={locale}>
      <AuthProvider>
        <AddContextProvider>
          <LayoutContent locale={locale}>{children}</LayoutContent>
        </AddContextProvider>
      </AuthProvider>
    </I18nProviderClient>
  )
}
