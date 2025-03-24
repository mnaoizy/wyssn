'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/locale/client'
import { Button } from './ui/button'
import { RocketIcon } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
} from './ui/dialog'
import { CustomDialogContent } from './ui/custom-dialog'
import { Textarea } from './ui/textarea'
import { useAddContext } from '@/contexts/add-context-provider'

export function AddContext() {
  const [note, setNote] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { contextValue, setContextValue } = useAddContext()
  const t = useI18n()

  useEffect(() => {
    if (contextValue) {
      setNote(contextValue)
    }
  }, [contextValue])

  const closeDialog = () => {
    setIsOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Add context value to /suggest request
    if (note.trim()) {
      setContextValue(note.trim())
      console.log('Context added for suggest requests:', note.trim())
    }
    closeDialog()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex h-9 items-center rounded-md border border-zinc-950/10 bg-white px-3 text-zinc-950 dark:border-zinc-50/10 dark:bg-zinc-700 dark:text-zinc-50 cursor-pointer shadow-xs"
        >
          <RocketIcon className="size-4" />
          <span className="text-sm">{t('main.add_context')}</span>
        </Button>
      </DialogTrigger>
      <CustomDialogContent className="p-0 sm:max-w-[640px]">
        <DialogTitle className="sr-only">{t('main.add_context')}</DialogTitle>
        <div className="w-full">
          <form className="flex h-full flex-col" onSubmit={handleSubmit}>
            <div className="relative h-[300px]">
              {!note && (
                <span
                  aria-hidden="true"
                  className="absolute top-3 left-4 text-sm text-zinc-500 select-none dark:text-zinc-400 z-10 pointer-events-none"
                >
                  {t('main.add_context')}
                </span>
              )}
              <Textarea
                className="h-full w-full resize-none bg-transparent px-3 py-2 text-sm outline-hidden border-none focus-visible:ring-0 shadow-none break-words overflow-auto"
                autoFocus
                onChange={(e) => setContextValue(e.target.value)}
                value={note}
                placeholder=""
                // Mobile zoom prevention
                style={{
                  fontSize: '16px',
                  overflowWrap: 'break-word',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word'
                }}
              />
            </div>
            <div
              className="flex justify-between py-1 px-1 border-t border-zinc-200 dark:border-zinc-600"
            >
              <Button
                variant="ghost"
                onClick={closeDialog}
                aria-label="Close dialog"
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="secondary"
                aria-label="Submit note"
                disabled={!note.trim()}
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </CustomDialogContent>
    </Dialog>
  )
}
