"use client";

import { I18nProviderClient, useI18n } from "@/locale/client";
import { AuthProvider } from "@/providers/auth-provider";
import { ReactElement, use } from "react";
import { LanguageSelector } from '@/components/language-selector';
import { Menu } from 'lucide-react';
import { RegisterLink, LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Link from 'next/link';
import { buttonVariants } from "@/components/ui/button";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

// Separate component that uses the I18n context
function LayoutContent({ children, locale }: { children: ReactElement; locale: string }) {
  const t = useI18n();
  const { isAuthenticated } = useKindeBrowserClient();

  return (
    <div className="font-sans flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-2xl">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Link href={`/${locale}`} className="font-serif text-lg font-semibold tracking-tighter select-none uppercase">Wyssn</Link>
              <span className="text-xs text-neutral-500 font-mono mt-1 select-none hidden sm:inline">/wɪzn/</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-end space-x-4 flex-1">
              <LanguageSelector />
              <div className="flex items-center space-x-4 text-sm">
                <span>{t('nav.about')}</span>
                <Link href={`/${locale}/changelog`} className="hover:text-neutral-500 transition-colors">{t('nav.changelog')}</Link>
                <div className="space-x-2">
                  {
                    isAuthenticated ? (
                      <LogoutLink lang={locale}>
                        <button className={buttonVariants({ variant: "secondary", size: "sm" })}>
                          {t('nav.signout')}
                        </button>
                      </LogoutLink>
                    ) : (
                      <>
                        <RegisterLink lang={locale} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                          {t('nav.signup')}
                        </RegisterLink>
                        <LoginLink lang={locale} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                          {t('nav.signin')}
                        </LoginLink>
                      </>
                    )
                  }
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-4">
              <LanguageSelector />
              <button
                className="text-neutral-500 hover:text-neutral-700"
                aria-label="Menu"
              >
                <Menu className="h-6 w-6" />
              </button>
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
            <span className="font-serif text-neutral-800 font-medium uppercase text-sm order-1 md:order-none">wyssn</span>

            <div className="flex gap-4 sm:gap-8 text-xs sm:text-sm text-neutral-400 order-3 md:order-none">
              <span className="cursor-default">{t('footer.privacy')}</span>
              <span className="cursor-default">{t('footer.terms')}</span>
              <span className="cursor-default">{t('footer.contact')}</span>
              <Link href={`/${locale}/changelog`} className="hover:text-neutral-500 transition-colors">{t('nav.changelog')}</Link>
            </div>

            <div className="text-xs sm:text-sm text-neutral-500 order-2 md:order-none mb-2 md:mb-0">
              {t('footer.copyright')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Layout({
  children,
  params,
}: {
  children: ReactElement;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);

  return (
    <I18nProviderClient locale={locale}>
      <AuthProvider>
        <LayoutContent locale={locale}>
          {children}
        </LayoutContent>
      </AuthProvider>
    </I18nProviderClient>
  );
}
