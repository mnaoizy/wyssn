import fs from 'fs/promises'
import path from 'path'
import { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import { markdownStyle } from '@/lib/markdown'
import { getCurrentLocale } from '@/locale/server'

export const locales = [
  'en-US',
  'fr-FR',
  'de-DE',
  'es-ES',
  'ja-JP',
  'zh-CN',
  'zh-TW',
  'ko-KR',
  'pt-BR',
  'ru-RU',
  'uk-UA',
  'it-IT',
  'vi-VN',
  'hi-IN',
] as const

// Define metadata for each locale
const metadataByLocale = {
  'en-US': {
    title: 'Terms | Wyssn',
    description: 'Terms of service',
  },
  'fr-FR': {
    title: "Conditions d'Utilisation | Wyssn",
    description: 'Conditions générales de service',
  },
  'de-DE': {
    title: 'Nutzungsbedingungen | Wyssn',
    description: 'Allgemeine Geschäftsbedingungen',
  },
  'es-ES': {
    title: 'Términos de Servicio | Wyssn',
    description: 'Condiciones del servicio',
  },
  'ja-JP': {
    title: '利用規約 | Wyssn',
    description: 'サービス利用規約',
  },
  'zh-CN': {
    title: '服务条款 | Wyssn',
    description: '使用条款',
  },
  'zh-TW': {
    title: '服務條款 | Wyssn',
    description: '使用條款',
  },
  'ko-KR': {
    title: '이용약관 | Wyssn',
    description: '서비스 이용약관',
  },
  'pt-BR': {
    title: 'Termos de Serviço | Wyssn',
    description: 'Termos de uso',
  },
  'ru-RU': {
    title: 'Условия использования | Wyssn',
    description: 'Пользовательское соглашение',
  },
  'uk-UA': {
    title: 'Умови використання | Wyssn',
    description: 'Умови надання послуг',
  },
  'it-IT': {
    title: 'Termini di Servizio | Wyssn',
    description: 'Condizioni di utilizzo',
  },
  'vi-VN': {
    title: 'Điều khoản dịch vụ | Wyssn',
    description: 'Điều khoản sử dụng',
  },
  'hi-IN': {
    title: 'सेवा की शर्तें | Wyssn',
    description: 'उपयोग की शर्तें',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale()
  const localeMetadata = metadataByLocale[locale] || metadataByLocale['en-US']

  return {
    title: localeMetadata.title,
    description: localeMetadata.description,
  }
}

async function getTermsContent() {
  try {
    const locale = await getCurrentLocale()
    const docsDir = path.join(process.cwd(), 'docs', 'terms')

    // First try the current locale
    const localeFilePath = path.join(docsDir, `${locale}.md`)

    try {
      // Check if the file exists before trying to read it
      await fs.access(localeFilePath)
      // If we get here, the file exists
      const fileContent = await fs.readFile(localeFilePath, 'utf8')
      return fileContent
    } catch (fileError) {
      console.error('Error reading terms file:', fileError)
      // File doesn't exist, fall back to English
      const englishFilePath = path.join(docsDir, 'en-US.md')

      try {
        // Check if English file exists
        await fs.access(englishFilePath)
        const englishContent = await fs.readFile(englishFilePath, 'utf8')
        return englishContent
      } catch (englishError) {
        // Even English file doesn't exist
        console.error('English fallback file not found:', englishError)
        return '# Terms\n\nNo terms content found.'
      }
    }
  } catch (error) {
    console.error('Error reading terms file:', error)
    return '# Terms\n\nNo terms content found.'
  }
}

export default async function TermsPage() {
  const termsContent = await getTermsContent()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-slate max-w-none">
        <ReactMarkdown components={markdownStyle}>{termsContent}</ReactMarkdown>
      </div>
    </div>
  )
}
