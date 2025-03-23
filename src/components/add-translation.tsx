'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/locale/client'
import { LanguagesIcon, XIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SUPPORTED_LOCALES } from '@/locale/config'

type Locale = keyof typeof SUPPORTED_LOCALES

interface AddTranslationProps {
  onTranslationLanguageSelect: (language: string | null) => void
}

export function AddTranslation({
  onTranslationLanguageSelect,
}: AddTranslationProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Locale | null>(null)
  const [showRemoveButton, setShowRemoveButton] = useState(false)
  const t = useI18n()

  // Update remove button visibility when language changes
  useEffect(() => {
    setShowRemoveButton(!!selectedLanguage)
  }, [selectedLanguage])

  const handleLanguageChange = (language: Locale) => {
    setSelectedLanguage(language)
    onTranslationLanguageSelect(language)
  }

  const handleRemoveTranslation = () => {
    setSelectedLanguage(null)
    onTranslationLanguageSelect(null)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 items-center gap-1">
        <Select
          value={selectedLanguage || ''}
          onValueChange={(value) => handleLanguageChange(value as Locale)}
        >
          <SelectTrigger>
            <div className="flex items-center">
              <LanguagesIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('main.translation')} />
            </div>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SUPPORTED_LOCALES).map(([code, name]) => (
              <SelectItem key={code} value={code}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showRemoveButton && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={handleRemoveTranslation}
            aria-label="Remove translation"
          >
            <XIcon className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
