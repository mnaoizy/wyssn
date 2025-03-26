'use client'

import { I18nProviderClient, useI18n } from '@/locale/client'
import { AuthProvider } from '@/providers/auth-provider'
import { AddContextProvider } from '@/contexts/add-context-provider'
import { ReactElement, use, useEffect, useRef } from 'react'
import { MobileNavigationPanel } from '@/components/mobile-navigation'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

// Separate component that uses the I18n context
function LayoutContent({
  children,
  locale,
}: {
  children: ReactElement
  locale: string
}) {
  const t = useI18n()
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

      <Navigation locale={locale} />

      {/* Main Content */}
      {children}

      <Footer locale={locale} />
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
