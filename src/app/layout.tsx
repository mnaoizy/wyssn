import { Fraunces, Outfit } from 'next/font/google'
import { getCurrentLocale } from '@/locale/server'
import { OpenPanelComponent } from '@openpanel/nextjs'
import './globals.css'
import { TopProgressBarProvider } from '@/providers/top-progress-provider'
import { Toaster } from 'react-hot-toast'
import { MobileNavigationProvider } from '@/components/mobile-navigation'

// Font setup
const serif = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-serif',
})

const sans = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-sans',
})

// Tell Next.js not to statically optimize
export const dynamic = 'force-dynamic'

// Dynamically generate metadata based on locale
export async function generateMetadata(): Promise<{
  title: string
  description: string
}> {
  // Default to English when locale isn't available
  let locale = 'en'
  try {
    locale = await getCurrentLocale()
  } catch (error) {
    console.error('Failed to get current locale:', error)
  }

  const metadataByLocale: Record<
    string,
    { title: string; description: string }
  > = {
    en: {
      title: 'WYSSN - Never be at a loss for words',
      description:
        'Your AI-powered conversation companion that helps you maintain meaningful dialogues with contextually appropriate suggestions.',
    },
    fr: {
      title: 'WYSSN - Ne manquez jamais de mots',
      description:
        "Votre compagnon de conversation alimenté par l'IA qui vous aide à maintenir des dialogues significatifs avec des suggestions contextuelles appropriées.",
    },
    ja: {
      title: 'WYSSN - 心に浮かぶ言葉を、形にする手助けをします。',
      description:
        'AIで駆動された会話の相棒で、適切なコンテキストの提案で意味のある対話を維持するのに役立ちます。',
    },
  }

  return metadataByLocale[locale] || metadataByLocale.en
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Default to English when locale isn't available
  let locale = 'en'
  try {
    locale = await getCurrentLocale()
  } catch (error) {
    console.error('Failed to get current locale:', error)
  }

  return (
    <>
      <OpenPanelComponent
        clientId="19d41b03-df44-43b1-ace4-70756914d9be"
        trackScreenViews={true}
      />
      <html lang={locale} className={`${sans.variable} ${serif.variable}`}>
        <body className="antialiased bg-white bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat">
          <TopProgressBarProvider>
            <MobileNavigationProvider>{children}</MobileNavigationProvider>
            <Toaster />
          </TopProgressBarProvider>
        </body>
      </html>
    </>
  )
}
