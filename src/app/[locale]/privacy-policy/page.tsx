import fs from 'fs/promises'
import path from 'path'
import { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import { markdownStyle } from '@/lib/markdown'
import { getCurrentLocale } from '@/locale/server'

// Define metadata for each locale
const metadataByLocale = {
  'en-US': {
    title: 'Privacy Policy | Wyssn',
    description: 'Privacy Policy',
  },
  'fr-FR': {
    title: 'Politique de Confidentialité | Wyssn',
    description: 'Politique de Confidentialité',
  },
  'de-DE': {
    title: 'Datenschutzrichtlinie | Wyssn',
    description: 'Datenschutzrichtlinie',
  },
  'es-ES': {
    title: 'Política de Privacidad | Wyssn',
    description: 'Política de Privacidad',
  },
  'ja-JP': {
    title: 'プライバシーポリシー | Wyssn',
    description: 'プライバシーポリシー',
  },
  'zh-CN': {
    title: '隐私政策 | Wyssn',
    description: '隐私政策',
  },
  'zh-TW': {
    title: '隱私政策 | Wyssn',
    description: '隱私政策',
  },
  'ko-KR': {
    title: '개인정보 보호정책 | Wyssn',
    description: '개인정보 보호정책',
  },
  'pt-BR': {
    title: 'Política de Privacidade | Wyssn',
    description: 'Política de Privacidade',
  },
  'ru-RU': {
    title: 'Политика конфиденциальности | Wyssn',
    description: 'Политика конфиденциальности',
  },
  'uk-UA': {
    title: 'Політика конфіденційності | Wyssn',
    description: 'Політика конфіденційності',
  },
  'it-IT': {
    title: 'Informativa sulla Privacy | Wyssn',
    description: 'Informativa sulla Privacy',
  },
  'vi-VN': {
    title: 'Chính sách bảo mật | Wyssn',
    description: 'Chính sách bảo mật',
  },
  'hi-IN': {
    title: 'गोपनीयता नीति | Wyssn',
    description: 'गोपनीयता नीति',
  },
  'th-TH': {
    title: 'นโยบายความเป็นส่วนตัว | Wyssn',
    description: 'นโยบายความเป็นส่วนตัว',
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

async function getPrivacyPolicyContent() {
  try {
    const locale = await getCurrentLocale()
    const docsDir = path.join(process.cwd(), 'docs', 'privacy-policy')

    // First try the current locale
    const localeFilePath = path.join(docsDir, `${locale}.md`)

    try {
      // Check if the file exists before trying to read it
      await fs.access(localeFilePath)
      // If we get here, the file exists
      const fileContent = await fs.readFile(localeFilePath, 'utf8')
      return fileContent
    } catch (fileError) {
      console.error('Error reading privacy policy file:', fileError)
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
        return '# Privacy Policy \n\nNo privacy policy content found.'
      }
    }
  } catch (error) {
    console.error('Error reading privacy policy file:', error)
    return '# Privacy Policy \n\nNo privacy policy content found.'
  }
}

export default async function PrivacyPolicyPage() {
  const privacyPolicyContent = await getPrivacyPolicyContent()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-slate max-w-none">
        <ReactMarkdown components={markdownStyle}>
          {privacyPolicyContent}
        </ReactMarkdown>
      </div>
    </div>
  )
}
