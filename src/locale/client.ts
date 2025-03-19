import { createI18nClient } from 'next-international/client'
import { messagesImport } from './config'

export const {
    useI18n,
    useScopedI18n,
    I18nProviderClient,
    useChangeLocale,
    useCurrentLocale
} = createI18nClient(messagesImport)
