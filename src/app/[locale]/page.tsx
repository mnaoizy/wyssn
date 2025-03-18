import { getI18n } from '@/locale/server';
import { LanguageSelector } from '@/components/language-selector';
import { Menu } from 'lucide-react';
import { SpeechRecognitionMinimal } from '@/components/speech-recognition-minimal';

export default async function Home() {
  const t = await getI18n()

  return (
    <div className="font-sans flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-2xl">
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
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-6xl 2xl:max-w-5xl text-center">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-neutral-900 mb-4 sm:mb-6 lg:mb-8 leading-tight tracking-[-0.02em]">
              {t('hero.title')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-neutral-700 mb-8 sm:mb-10 lg:mb-12 font-light leading-relaxed tracking-tight max-w-3xl mx-auto lg:max-w-4xl xl:max-w-5xl">
              {t('hero.description')}
            </p>

            <div className='w-full mb-8'>
              <SpeechRecognitionMinimal />
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-6 sm:py-8 bg-neutral-50 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-2xl">
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