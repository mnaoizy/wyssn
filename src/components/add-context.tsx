'use client'

import { motion } from 'motion/react'
import { useId, useState } from 'react'
import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverTrigger,
} from './motion-primitives/morphing-popover'
import { useI18n } from '@/locale/client'
import { Button } from './ui/button'
import { RocketIcon } from 'lucide-react'

export function AddContext() {
  const uniqueId = useId()
  const [note, setNote] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const t = useI18n()

  const closeMenu = () => {
    setNote('')
    setIsOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // ここで送信処理を行う
    closeMenu()
  }

  return (
    <MorphingPopover
      transition={{
        type: 'spring',
        bounce: 0.05,
        duration: 0.3,
      }}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <MorphingPopoverTrigger className="flex h-9 items-center rounded-md border border-zinc-950/10 bg-white px-3 text-zinc-950 dark:border-zinc-50/10 dark:bg-zinc-700 dark:text-zinc-50 cursor-pointer shadow-xs">
        <RocketIcon className="size-4 mr-[5px]" />
        <motion.span layoutId={`popover-label-${uniqueId}`} className="text-sm">
          {t('main.add_context')}
        </motion.span>
      </MorphingPopoverTrigger>
      <MorphingPopoverContent className="rounded-md border border-zinc-950/10 bg-white p-0 shadow-[0_9px_9px_0px_rgba(0,0,0,0.01),_0_2px_5px_0px_rgba(0,0,0,0.06)] dark:bg-zinc-700">
        <div className="w-full md:w-[640px]">
          <form className="flex h-full flex-col" onSubmit={handleSubmit}>
            <div className="relative h-[300px]">
              <motion.span
                layoutId={`popover-label-${uniqueId}`}
                aria-hidden="true"
                style={{
                  opacity: note ? 0 : 1,
                }}
                className="absolute top-3 left-4 text-sm text-zinc-500 select-none dark:text-zinc-400"
              >
                {t('main.add_context')}
              </motion.span>
              <textarea
                className="h-full w-full resize-none rounded-md bg-transparent px-4 py-3 text-sm outline-hidden"
                autoFocus
                onChange={(e) => setNote(e.target.value)}
                value={note}
                placeholder=""
                // モバイルでズームしないように以下の設定を追加
                style={{ fontSize: '16px' }}
              />
            </div>
            <div
              key="close"
              className="flex justify-between py-1 px-1 border-t border-zinc-200 dark:border-zinc-600"
            >
              <Button
                variant="ghost"
                onClick={closeMenu}
                aria-label="Close popover"
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
      </MorphingPopoverContent>
    </MorphingPopover>
  )
}
