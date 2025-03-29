'use client'

import { useI18n } from '@/locale/client'
import Link from 'next/link'
import { ContactDialog } from '@/components/ui/contact-dialog'

interface FooterProps {
    locale: string
}

export function Footer({ locale }: FooterProps) {
    const t = useI18n()

    return (
        <footer className="border-t border-gray-200 backdrop-blur-lg bg-white/85  py-6 sm:py-8 mt-auto">
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
                        {/* <Link
                            href={`/${locale}/terms`}
                            className="hover:text-neutral-500 transition-colors"
                        >
                            {t('footer.terms')}
                        </Link> */}
                        {/* 
                        {locale === 'ja-JP' && (
                            <Link
                                href={`/${locale}/commercial`}
                                className="hover:text-neutral-500 transition-colors"
                            >
                                特定商取引法に基づく表記
                            </Link>
                        )} */}
                        <ContactDialog>
                            <span className="hover:text-neutral-500 transition-colors cursor-pointer">
                                {t('footer.contact')}
                            </span>
                        </ContactDialog>
                        <Link
                            href={`/${locale}/changelog`}
                            className="hover:text-neutral-500 transition-colors"
                        >
                            {t('nav.changelog')}
                        </Link>
                        {/* <Link
                            href={`/${locale}/pricing`}
                            className="hover:text-neutral-500 transition-colors"
                        >
                            {t('nav.pricing')}
                        </Link> */}
                    </div>

                    <div className="text-xs sm:text-sm text-neutral-500 order-2 md:order-none mb-2 md:mb-0">
                        {t('footer.copyright')}
                    </div>
                </div>
            </div>
        </footer>
    )
}
