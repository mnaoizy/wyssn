'use client'

import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/locale/client'
import { Button } from './ui/button'
import { LayersIcon } from 'lucide-react'
import { Dialog, DialogTrigger, DialogTitle } from './ui/dialog'
import { CustomDialogContent } from './ui/custom-dialog'
import { Textarea } from './ui/textarea'
import { useAddContext } from '@/contexts/add-context-provider'

export function AddContext() {
  const [note, setNote] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { contextValue, setContextValue } = useAddContext()
  const t = useI18n()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (contextValue) {
      setNote(contextValue)
    }
  }, [contextValue])

  // ダイアログが開いたときにフォーカスと選択範囲を設定
  useEffect(() => {
    if (isOpen) {
      // DOM更新とアニメーション完了後に実行するため少し遅延
      const timerId = setTimeout(() => {
        if (textareaRef.current) {
          // 確実にレンダリング後にフォーカス
          textareaRef.current.focus()

          // カーソルを最後に移動（値の長さを取得）
          const length = textareaRef.current.value.length
          textareaRef.current.setSelectionRange(length, length)
        }
      }, 150)

      return () => clearTimeout(timerId)
    }
  }, [isOpen])

  const closeDialog = () => {
    setIsOpen(false)
  }

  const handleClear = () => {
    setNote('')
    setContextValue('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (note.trim()) {
      setContextValue(note.trim())
      console.log('Context added for suggest requests:', note.trim())
    }
    closeDialog()
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setNote(newValue)
    setContextValue(newValue)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex h-9 items-center rounded-md border border-zinc-950/10 bg-white px-3 text-zinc-950 dark:border-zinc-50/10 dark:bg-zinc-700 dark:text-zinc-50 cursor-pointer shadow-xs"
        >
          <LayersIcon className="size-4" />
          <span className="text-sm">{t('main.add_context')}</span>
        </Button>
      </DialogTrigger>
      <CustomDialogContent
        className="p-0 sm:max-w-[640px]"
        onOpenAutoFocus={(e) => {
          // デフォルトの自動フォーカス動作を防ぐ
          e.preventDefault()
        }}
      >
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
                ref={textareaRef}
                className="h-full w-full resize-none bg-transparent px-3 py-2 text-sm outline-hidden border-none focus-visible:ring-0 shadow-none break-words overflow-auto"
                onChange={handleChange}
                value={note}
                placeholder=""
                // autoFocusを追加
                autoFocus
                // カーソル表示のための追加スタイル
                style={{
                  fontSize: '16px',
                  overflowWrap: 'break-word',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  WebkitTextFillColor: 'currentcolor',
                  imeMode: 'active',
                  caretColor: 'auto', // カーソル色を明示的に設定
                }}
              />
            </div>
            <div className="flex justify-end py-1 px-1 border-t gap-1 border-gray-200 dark:border-gray-600 bg-gray-50">
              <Button
                variant="outline"
                size="sm"
                onClick={closeDialog}
                aria-label="Close dialog"
                type="button"
              >
                {t('main.cancel')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!note.trim()}
                onClick={handleClear}
                aria-label="Clear note"
                type="button"
              >
                {t('main.clear')}
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="default"
                aria-label="Submit note"
                disabled={!note.trim()}
              >
                {t('main.add_context')}
              </Button>
            </div>
          </form>
        </div>
      </CustomDialogContent>
    </Dialog>
  )
}
