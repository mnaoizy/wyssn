import { getI18n } from '@/locale/server';
import { LanguageSelector } from '@/components/language-selector';
import { SendHorizontal, Mail, Menu } from 'lucide-react';

export default async function Home() {
  const t = await getI18n()

  return (
    <div className="font-sans flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-semibold tracking-tighter select-none uppercase">Wyssn</span>
              <span className="text-xs text-neutral-500 font-mono mt-1 select-none hidden sm:inline">/wɪzn/</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-end space-x-4 flex-1">
              <LanguageSelector />

              <div className="flex gap-6 opacity-30 select-none">
                <span className="text-sm text-neutral-400 cursor-default">{t('nav.about')}</span>
                <span className="text-sm text-neutral-400 cursor-default">{t('nav.changelog')}</span>
                <span className="text-sm text-neutral-400 cursor-default">
                  {t('nav.signin')}
                </span>
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
      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="flex-grow flex items-center justify-center py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-neutral-900 mb-4 sm:mb-6 lg:mb-8 leading-tight tracking-[-0.02em]">
              {t('hero.title')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-neutral-700 mb-8 sm:mb-10 lg:mb-12 font-light leading-relaxed tracking-tight max-w-3xl mx-auto">
              {t('hero.description')}
            </p>

            {/* Waitlist Form */}
            <div className="max-w-md mx-auto select-none opacity-30">
              <div className="relative flex items-center mb-2">
                <input
                  type="email"
                  placeholder={t('hero.email_placeholder')}
                  disabled
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-12 rounded-full border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm sm:text-base"
                />
                <button
                  disabled
                  className="absolute right-1.5 bg-neutral-900 text-white p-1.5 sm:p-2 rounded-full cursor-not-allowed opacity-90 hover:opacity-100 transition-opacity"
                  aria-label="Join waitlist"
                >
                  <SendHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 italic flex items-center justify-center gap-1">
                <Mail className="w-3 h-3" />
                {t('hero.waitlist')}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-6 sm:py-8 bg-neutral-50 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-4">
            <span className="font-serif text-neutral-800 font-medium uppercase text-sm order-1 md:order-none">wyssn</span>

            <div className="flex gap-4 sm:gap-8 text-xs sm:text-sm text-neutral-400 order-3 md:order-none">
              <span className="cursor-default">{t('footer.privacy')}</span>
              <span className="cursor-default">{t('footer.terms')}</span>
              <span className="cursor-default">{t('footer.contact')}</span>
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