'use client'

import { useChangeLocale, useCurrentLocale } from '@/locale/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Globe, Loader2 } from 'lucide-react'
import { Suspense, useReducer, useTransition, useEffect } from 'react'
import { SUPPORTED_LOCALES } from '@/locale/config'
type Locale = keyof typeof SUPPORTED_LOCALES

// 状態の型定義
interface LanguageState {
  isChangingLocale: boolean
  targetLocale: Locale | null
}

// アクションの型定義
type LanguageAction =
  | { type: 'START_LOCALE_CHANGE'; payload: Locale }
  | { type: 'COMPLETE_LOCALE_CHANGE' }
  | { type: 'CANCEL_LOCALE_CHANGE' }

// 初期状態
const initialState: LanguageState = {
  isChangingLocale: false,
  targetLocale: null,
}

// リデューサー関数
function languageReducer(
  state: LanguageState,
  action: LanguageAction
): LanguageState {
  switch (action.type) {
    case 'START_LOCALE_CHANGE':
      return {
        ...state,
        isChangingLocale: true,
        targetLocale: action.payload,
      }
    case 'COMPLETE_LOCALE_CHANGE':
      return {
        ...state,
        isChangingLocale: false,
        targetLocale: null,
      }
    case 'CANCEL_LOCALE_CHANGE':
      return {
        ...state,
        isChangingLocale: false,
        targetLocale: null,
      }
    default:
      return state
  }
}

// カスタムフック
function useLanguageSelector() {
  const changeLocale = useChangeLocale({ preserveSearchParams: true })
  const currentLocale = useCurrentLocale()
  const [isPending, startTransition] = useTransition()
  const [state, dispatch] = useReducer(languageReducer, initialState)

  // 現在のロケールがターゲットロケールと一致したらロケール変更完了とする
  useEffect(() => {
    if (state.targetLocale && state.targetLocale === currentLocale) {
      dispatch({ type: 'COMPLETE_LOCALE_CHANGE' })
    }
  }, [currentLocale, state.targetLocale])

  // ロケール変更のハンドラー
  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return

    dispatch({ type: 'START_LOCALE_CHANGE', payload: newLocale })

    startTransition(() => {
      changeLocale(newLocale)
    })
  }

  // ローディング状態の計算
  const isLoading = isPending || state.isChangingLocale

  return {
    currentLocale,
    isLoading,
    handleLocaleChange,
  }
}

function LanguageSelectorInner() {
  const { currentLocale, isLoading, handleLocaleChange } = useLanguageSelector()

  return (
    <Select
      value={currentLocale}
      onValueChange={handleLocaleChange}
      disabled={isLoading}
    >
      <SelectTrigger className="flex gap-2" aria-label="language-selector"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Globe className="h-4 w-4" />
        )}
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SUPPORTED_LOCALES).map(([code, name]) => (
          <SelectItem key={code} value={code}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function LanguageSelector() {
  return (
    <Suspense
      fallback={
        <div className="w-[130px] h-9 bg-neutral-100 animate-pulse rounded-md" />
      }
    >
      <LanguageSelectorInner />
    </Suspense>
  )
}
