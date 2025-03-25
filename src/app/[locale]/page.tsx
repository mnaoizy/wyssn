import { getI18n } from '@/locale/server'
import { UtteranceProvider } from '@/contexts/utterance-context'
import { SpeechRecognition } from '@/components/speech-recognition'

export default async function Home() {
  const t = await getI18n()
  return (
    <main>
      {/* Main Content - Wrapped in UtteranceProvider */}
      <UtteranceProvider>
        <SpeechRecognition
          heroTitle={t('hero.title')}
          heroDescription={t('hero.description')}
        />
      </UtteranceProvider>
    </main>
  )
}
