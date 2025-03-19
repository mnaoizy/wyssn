import { getI18n } from '@/locale/server';
import { UtteranceProvider } from '@/contexts/utterance-context';
import { SpeechRecognitionMinimal } from '@/components/speech-recognition-minimal';

export default async function Home() {
  const t = await getI18n();

  return (
    <main>
      {/* Main Content - Wrapped in UtteranceProvider */}
      <UtteranceProvider>
        <SpeechRecognitionMinimal
          heroTitle={t('hero.title')}
          heroDescription={t('hero.description')}
        />
      </UtteranceProvider>
    </main>
  )
}
