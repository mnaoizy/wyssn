import { getI18n } from '@/locale/server';
import { SendHorizontal, Mail } from 'lucide-react';

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
              <span className="text-xs text-neutral-500 font-mono mt-1 select-none">/wɪzn/</span>
            </div>
            <div className="flex gap-6 opacity-30 select-none">
              <span className="text-sm text-neutral-400 cursor-default">{t('nav.about')}</span>
              <span className="text-sm text-neutral-400 cursor-default">{t('nav.changelog')}</span>
              <span className="text-sm text-neutral-400 cursor-default">
                {t('nav.signin')}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="flex-grow flex items-center justify-center py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-semibold text-neutral-900 mb-8 leading-tight tracking-[-0.02em]">
              {t('hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-neutral-700 mb-12 font-light leading-relaxed tracking-tight max-w-3xl mx-auto">
              {t('hero.description')}
            </p>

            {/* Waitlist Form */}
            <div className="max-w-md mx-auto select-none opacity-30">
              <div className="relative flex items-center mb-2">
                <input
                  type="email"
                  placeholder={t('hero.email_placeholder')}
                  disabled
                  className="w-full px-4 py-3 pr-12 rounded-full border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
                />
                <button
                  disabled
                  className="absolute right-1.5 bg-neutral-900 text-white p-2 rounded-full cursor-not-allowed opacity-90 hover:opacity-100 transition-opacity"
                  aria-label="Join waitlist"
                >
                  <SendHorizontal className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-neutral-500 italic flex items-center justify-center gap-1">
                <Mail className="w-3 h-3" />
                {t('hero.waitlist')}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8 bg-neutral-50 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-serif text-neutral-800 font-medium uppercase text-sm">wyssn</span>

            <div className="flex gap-8 text-sm text-neutral-400">
              <span className="cursor-default">{t('footer.privacy')}</span>
              <span className="cursor-default">{t('footer.terms')}</span>
              <span className="cursor-default">{t('footer.contact')}</span>
            </div>
            <div className="text-sm text-neutral-500">
              {t('footer.copyright')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
