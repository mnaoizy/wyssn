'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useSpeechRecognition, MicButton } from '@/hooks/use-speech-recognition'
import { useUtterances } from '@/contexts/utterance-context'
import { useAddContext } from '@/contexts/add-context-provider'
import { useCurrentLocale } from '@/locale/client'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { cn } from '@/lib/utils'
import { conversationSuggestionSchema } from '@/types/shared-types'
import { useSuggestions } from '@/hooks/use-suggestions'
import { ClientSuggestion } from '@/types/suggestions'
import { Skeleton } from '@/components/ui/skeleton'

// Import our new components
import { RecognitionStatus } from './recognition-status'
import { TranscriptDisplay } from './transcript-display'
import { ControlPanel } from './control-panel'
import toast from 'react-hot-toast'
import { Locale } from '@/locale/config'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import Image from 'next/image'

export interface SpeechRecognitionProps {
  heroTitle?: string
  heroDescription?: string
  utteranceInterval?: number
  onUtteranceIntervalChange?: (interval: number) => void
}

/**
 * Container component for the speech recognition feature,
 * orchestrating all sub-components and managing state
 */
export const SpeechRecognitionContainer: React.FC<SpeechRecognitionProps> = ({
  heroTitle,
  heroDescription,
  utteranceInterval = 1,
  onUtteranceIntervalChange,
}) => {
  // Add client-side only initialization
  const [mounted, setMounted] = useState(false)
  // Get utterances from context instead of just from the hook
  const { utterances: contextUtterances, setUtterances } = useUtterances()
  // Add state for displaying interim text
  const [interimText, setInterimText] = useState('')
  // Add state for utterance interval if no prop is provided
  const [localUtteranceInterval, setLocalUtteranceInterval] =
    useState(utteranceInterval)
  // Add state for translation language
  const [translationLanguage, setTranslationLanguage] = useState<string | null>(
    null
  )
  // Get context value from our context provider
  const { contextValue } = useAddContext()
  // 発話カウンター
  const utteranceCounterRef = useRef<number>(0)

  const { isAuthenticated } = useKindeBrowserClient()

  // References for submission functionality
  const submitRef = useRef<
    | ((data: {
      message: string
      translationLanguage?: string | null
      locale: Locale
      context?: string
      utteranceHistory?: Array<string>
    }) => void)
    | undefined
  >(undefined)
  const resetHiddenRef = useRef<(() => void) | undefined>(undefined)
  const isLoadingRef = useRef<boolean>(false)

  const {
    submit,
    isLoading,
    object,
    error: suggestError,
  } = useObject({
    api: '/api/suggest',
    schema: conversationSuggestionSchema,
  })

  useEffect(() => {
    if (suggestError) {
      toast('Failed to generate conversation suggestions')
    }
  }, [suggestError])

  // Use custom hook for suggestions management
  const { suggestionsWithId, dispatch, resetHidden } = useSuggestions(
    object?.suggestions?.filter(
      (suggestion): suggestion is ClientSuggestion => !!suggestion
    ) || []
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  // Store the last processed utterance ID to avoid duplicate submissions
  const lastProcessedUtteranceIdRef = useRef<string | null>(null)

  // 関数や状態を ref に保存して最新の値を常に参照できるようにする
  useEffect(() => {
    submitRef.current = submit
    resetHiddenRef.current = resetHidden
    isLoadingRef.current = isLoading
  }, [submit, resetHidden, isLoading])

  // Track if we've ever been in listening state
  const [hasEverListened, setHasEverListened] = useState(false)

  const {
    isListening,
    error,
    isSupported,
    utterances: speechUtterances,
    interimTranscript, // Get the current interim transcription
    startListening,
    stopListening,
    changeLanguage,
  } = useSpeechRecognition({
    continuous: true,
    shouldPersistTranscript: true,
    interimResults: true,
    onFinalUtterance(utterance, allUtterances) {
      // Retain all utterances but control what is displayed
      setUtterances(allUtterances)
      // Clear interim transcription (since it has been finalized)
      setInterimText('')
    },
  })

  const currentLocale = useCurrentLocale()

  useEffect(() => {
    if (currentLocale) {
      changeLanguage(currentLocale)
    }
  }, [currentLocale])

  // Watch for new final utterances and trigger submit based on interval
  useEffect(() => {
    if (contextUtterances.length > 0 && submitRef.current) {
      const finalUtterances = contextUtterances.filter((u) => u.isFinal)

      if (finalUtterances.length > 0) {
        // Get the latest final utterance
        const latestUtterance = finalUtterances[finalUtterances.length - 1]

        // Only process if we haven't processed this utterance before
        if (latestUtterance.id !== lastProcessedUtteranceIdRef.current) {
          lastProcessedUtteranceIdRef.current = latestUtterance.id
          // Increment the counter
          utteranceCounterRef.current += 1
          // Check if we should submit based on the interval
          const currentInterval = onUtteranceIntervalChange
            ? utteranceInterval
            : localUtteranceInterval
          const shouldSubmit = utteranceCounterRef.current >= currentInterval

          if (shouldSubmit) {
            // Get all final utterances text combined
            const finalText = finalUtterances.map((u) => u.text).join(' ')
            // Use the actual utterance text for auto-submission
            if (submitRef.current && finalText.trim()) {
              console.log('Auto-submitting with utterance text:', finalText)
              if (resetHiddenRef.current) {
                resetHiddenRef.current()
              }
              submitRef.current({
                message: finalText,
                translationLanguage: translationLanguage,
                locale: currentLocale,
                context: contextValue || undefined,
                utteranceHistory: contextUtterances.filter(u => u.isFinal).map(u => u.text)
              })

              // Reset the counter after submission
              utteranceCounterRef.current = 0
            }
          }
        }
      }
    }
  }, [
    contextUtterances,
    utteranceInterval,
    localUtteranceInterval,
    onUtteranceIntervalChange,
    translationLanguage,
    currentLocale,
    contextValue,
  ])

  // Update interim transcription
  useEffect(() => {
    if (interimTranscript) {
      setInterimText(interimTranscript)
    }
  }, [interimTranscript])

  // Track if we've ever been in listening state
  useEffect(() => {
    if (isListening) {
      setHasEverListened(true)
    }
  }, [isListening])

  // Auxiliary useEffect to reflect the hook's utterance history in the context
  useEffect(() => {
    if (speechUtterances.length > 0) {
      const existingIds = new Set(contextUtterances.map((u) => u.id))
      const newUtterances = speechUtterances.filter(
        (u) => !existingIds.has(u.id)
      )

      if (newUtterances.length > 0) {
        setUtterances([...contextUtterances, ...newUtterances])
      }
    }
  }, [speechUtterances, contextUtterances, setUtterances])

  // Get only finalized utterances
  const finalUtterances = contextUtterances
    .filter((u) => u.isFinal)
    .sort((a, b) => a.timestamp - b.timestamp) // Sort by timestamp in ascending order

  // Helper function to handle interval changes
  const handleUtteranceIntervalChange = (interval: number) => {
    setLocalUtteranceInterval(interval)
    utteranceCounterRef.current = 0 // カウンターをリセット
  }

  // Helper function to handle translation language changes
  const handleTranslationLanguageSelect = (language: string | null) => {
    setTranslationLanguage(language)
  }

  const handleStartListening = () => {
    if (isAuthenticated) {
      startListening()
    } else {
      toast.error('You need to sign in to use this.')
    }
  }

  return (
    <main className="flex-grow flex flex-col">
      {/* Hero Section */}
      <section className="flex-grow flex justify-center items-start py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="w-full max-w-5xl mx-auto px-2 sm:px-3 lg:px-8 xl:max-w-6xl 2xl:max-w-5xl text-center min-w-xs relative">
          {/* Add wrapper container with fixed height */}
          {heroTitle && heroDescription && (
            <div
              className={cn(
                'transition-all duration-1200 ease-custom h-auto',
                hasEverListened
                  ? '-mt-4 md:-mt-8'
                  : 'mt-4 md:mt-8 lg:mt-8 xl:mt-16'
              )}
            >
              {/* Apply transform to this element */}
              <div
                className={cn(
                  'transform transition-transform duration-1000 ease-custom origin-center flex flex-col items-center',
                  hasEverListened ? 'scale-80' : 'scale-100'
                )}
              >
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4 leading-tight tracking-tight">
                  {heroTitle}
                </h1>
                <p className={cn(
                  "text-base sm:text-lg md:text-xl text-gray-700 font-normal leading-relaxed tracking-tight max-w-3xl mx-auto lg:max-w-4xl xl:max-w-5xl transition-all duration-1200 ease-custom",
                  hasEverListened ? "mb-2 sm:mb-3 lg:mb-4" : "mb-5 sm:mb-6 lg:mb-7"
                )}>
                  {heroDescription}
                </p>
              </div>
              <div className="absolute -top-6 -left-4 sm:-top-8 md:-top-10 lg:-top-12 -z-1 w-[150px] sm:w-[180px] md:w-[200px] lg:w-[220px] xl:w-[250px]">
                <Image
                  src="/hero.png"
                  alt="Hero"
                  width={500}
                  height={500}
                  className="w-full h-full object-contain select-none"
                  quality={100}
                  priority
                />
              </div>

            </div>
          )}

          {mounted ? (
            <div
              className={cn(
                "w-full max-w-full p-1 md:p-4 border rounded-lg mb-8 transition-shadow bg-white/85 backdrop-blur-md",
                isListening
                  ? "border-gray-300 shadow-[0_4px_30px_rgba(0,0,0,0.12)]"
                  : "border-gray-200 shadow-[0_4px_30px_rgba(0,0,0,0.08)]"
              )}
              data-testid="speech-recognition-container"
            >

              {/* Control Panel */}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <ControlPanel
                  utteranceInterval={
                    onUtteranceIntervalChange
                      ? utteranceInterval
                      : localUtteranceInterval
                  }
                  onUtteranceIntervalChange={handleUtteranceIntervalChange}
                  onExternalIntervalChange={onUtteranceIntervalChange}
                  onTranslationLanguageSelect={handleTranslationLanguageSelect}
                />

                {mounted && (
                  <MicButton
                    isListening={isListening}
                    onStart={handleStartListening}
                    onStop={stopListening}
                    disabled={!isSupported}
                  />
                )}
              </div>

              {/* Recognition Status */}
              <RecognitionStatus error={error} isSupported={isSupported} />

              {/* Transcript Display with Autocomplete */}
              <TranscriptDisplay
                finalUtterances={finalUtterances}
                interimText={interimText}
                suggestionsWithId={suggestionsWithId}
                isLoading={isLoading}
                onSuggestionSelect={(suggestion) => {
                  console.log('Selected suggestion:', suggestion)
                  // Handle suggestion selection - e.g. pin the suggestion or trigger an action
                  if (suggestion && suggestion.id) {
                    dispatch({
                      type: 'TOGGLE_PIN',
                      suggestion: suggestion,
                    })
                  }
                }}
              />
            </div>
          ) : (
            <div className="w-full max-w-full p-1 md:p-4 border rounded-lg shadow-sm mb-8">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>

              <div className="space-y-4">
                <Skeleton className="h-4 w-48" />
                <div className="h-32 rounded-md border p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
