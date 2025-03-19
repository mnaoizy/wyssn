export const locales = ['en-US', 'fr-FR', 'de-DE', 'es-ES', 'ja-JP', 'zh-CN', 'zh-TW', 'ko-KR'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en-US';

// 各ロケールのインポートは手動で設定して型補完を確保
export const messagesImport = {
    "en-US": () => import('./messages/en-US'),
    "fr-FR": () => import('./messages/fr-FR'),
    "de-DE": () => import('./messages/de-DE'),
    "es-ES": () => import('./messages/es-ES'),
    "ja-JP": () => import('./messages/ja-JP'),
    "zh-CN": () => import('./messages/zh-CN'),
    "zh-TW": () => import('./messages/zh-TW'),
    "ko-KR": () => import('./messages/ko-KR'),
} as const;