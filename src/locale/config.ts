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
  'th-TH',
] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en-US'

// 各ロケールのインポートは手動で設定して型補完を確保
export const messagesImport = {
  'en-US': () => import('./messages/en-US'),
  'fr-FR': () => import('./messages/fr-FR'),
  'de-DE': () => import('./messages/de-DE'),
  'es-ES': () => import('./messages/es-ES'),
  'ja-JP': () => import('./messages/ja-JP'),
  'zh-CN': () => import('./messages/zh-CN'),
  'zh-TW': () => import('./messages/zh-TW'),
  'ko-KR': () => import('./messages/ko-KR'),
  'pt-BR': () => import('./messages/pt-BR'),
  'ru-RU': () => import('./messages/ru-RU'),
  'uk-UA': () => import('./messages/uk-UA'),
  'it-IT': () => import('./messages/it-IT'),
  'vi-VN': () => import('./messages/vi-VN'),
  'hi-IN': () => import('./messages/hi-IN'),
  'th-TH': () => import('./messages/th-TH'),
} as const

export const SUPPORTED_LOCALES = {
  'en-US': 'English',
  'fr-FR': 'Français',
  'de-DE': 'Deutsch',
  'es-ES': 'Español',
  'ja-JP': '日本語',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'ko-KR': '한국어',
  'pt-BR': 'Português',
  'ru-RU': 'Русский',
  'uk-UA': 'Українська',
  'it-IT': 'Italiano',
  'vi-VN': 'Tiếng Việt',
  'hi-IN': 'हिन्दी',
  'th-TH': 'ไทย',
} as const
