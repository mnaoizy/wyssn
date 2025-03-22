'use client'

import {
  useState,
  useId,
  useRef,
  useEffect,
  createContext,
  useContext,
  isValidElement,
} from 'react'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  Transition,
  Variants,
} from 'motion/react'
import useClickOutside from '@/hooks/use-click-outside'
import { cn } from '@/lib/utils'

const TRANSITION = {
  type: 'spring',
  bounce: 0.1,
  duration: 0.4,
}

type MorphingPopoverContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
  uniqueId: string
  variants?: Variants
  isMobile: boolean
}

const MorphingPopoverContext =
  createContext<MorphingPopoverContextValue | null>(null)

function usePopoverLogic({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
} = {}) {
  const uniqueId = useId()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // 初期チェック
    checkIfMobile()

    // リサイズイベントリスナーの追加
    window.addEventListener('resize', checkIfMobile)

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  const isOpen = controlledOpen ?? uncontrolledOpen

  const open = () => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(true)
    }
    onOpenChange?.(true)
  }

  const close = () => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(false)
    }
    onOpenChange?.(false)
  }

  return { isOpen, open, close, uniqueId, isMobile }
}

export type MorphingPopoverProps = {
  children: React.ReactNode
  transition?: Transition
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variants?: Variants
  className?: string
} & React.ComponentProps<'div'>

function MorphingPopover({
  children,
  transition = TRANSITION,
  defaultOpen,
  open,
  onOpenChange,
  variants,
  className,
  ...props
}: MorphingPopoverProps) {
  const popoverLogic = usePopoverLogic({ defaultOpen, open, onOpenChange })

  return (
    <MorphingPopoverContext.Provider value={{ ...popoverLogic, variants }}>
      <MotionConfig transition={transition}>
        <div
          className={cn('relative flex items-center justify-center', className)}
          key={popoverLogic.uniqueId}
          {...props}
        >
          {children}
        </div>
      </MotionConfig>
    </MorphingPopoverContext.Provider>
  )
}

export type MorphingPopoverTriggerProps = {
  asChild?: boolean
  children: React.ReactNode
  className?: string
} & React.ComponentProps<typeof motion.button>

function MorphingPopoverTrigger({
  children,
  className,
  asChild = false,
  ...props
}: MorphingPopoverTriggerProps) {
  const context = useContext(MorphingPopoverContext)
  if (!context) {
    throw new Error(
      'MorphingPopoverTrigger must be used within MorphingPopover'
    )
  }

  if (asChild && isValidElement(children)) {
    const MotionComponent = motion.create(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      children.type as React.ForwardRefExoticComponent<any>
    )
    const childProps = children.props as Record<string, unknown>

    return (
      <MotionComponent
        {...childProps}
        onClick={context.open}
        layoutId={`popover-trigger-${context.uniqueId}`}
        className={childProps.className}
        key={context.uniqueId}
        aria-expanded={context.isOpen}
        aria-controls={`popover-content-${context.uniqueId}`}
      />
    )
  }

  return (
    <motion.div
      key={context.uniqueId}
      layoutId={`popover-trigger-${context.uniqueId}`}
      onClick={context.open}
    >
      <motion.button
        {...props}
        layoutId={`popover-label-${context.uniqueId}`}
        key={context.uniqueId}
        className={className}
        aria-expanded={context.isOpen}
        aria-controls={`popover-content-${context.uniqueId}`}
      >
        {children}
      </motion.button>
    </motion.div>
  )
}

export type MorphingPopoverContentProps = {
  children: React.ReactNode
  className?: string
} & React.ComponentProps<typeof motion.div>

function MorphingPopoverContent({
  children,
  className,
  ...props
}: MorphingPopoverContentProps) {
  const context = useContext(MorphingPopoverContext)
  if (!context)
    throw new Error(
      'MorphingPopoverContent must be used within MorphingPopover'
    )

  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  useClickOutside(ref as React.RefObject<HTMLElement>, context.close)

  useEffect(() => {
    if (!context.isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') context.close()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [context.isOpen, context.close])

  // ポップオーバーの位置調整
  useEffect(() => {
    if (!context.isOpen || !ref.current || context.isMobile) return

    const adjustPosition = () => {
      const popover = ref.current
      if (!popover) return

      // 現在のサイズと位置を取得
      const rect = popover.getBoundingClientRect()

      // 画面の左端からはみ出す場合
      if (rect.left < 0) {
        popover.style.marginLeft = `${Math.abs(rect.left) + 10}px`
      }

      // 画面の右端からはみ出す場合
      if (rect.right > window.innerWidth) {
        popover.style.marginLeft = `${window.innerWidth - rect.right - 10}px`
      }
    }

    // 初回実行
    setTimeout(adjustPosition, 0)

    // リサイズイベントのリスナー
    window.addEventListener('resize', adjustPosition)

    return () => {
      window.removeEventListener('resize', adjustPosition)
    }
  }, [context.isOpen, context.isMobile])

  return (
    <AnimatePresence>
      {context.isOpen && (
        <div
          ref={containerRef}
          className={
            context.isMobile
              ? 'fixed inset-0 z-50 flex items-end justify-center'
              : 'fixed inset-0 z-50 flex items-center justify-center pointer-events-none'
          }
          style={{ pointerEvents: 'none' }}
        >
          <motion.div
            {...props}
            ref={ref}
            layoutId={`popover-trigger-${context.uniqueId}`}
            key={context.uniqueId}
            id={`popover-content-${context.uniqueId}`}
            role="dialog"
            aria-modal="true"
            className={cn(
              'overflow-hidden rounded-md border border-zinc-950/10 bg-white p-2 text-zinc-950 shadow-md dark:border-zinc-50/10 dark:bg-zinc-700 dark:text-zinc-50 pointer-events-auto',
              context.isMobile ? 'w-full mx-4 mb-4 rounded-xl' : '',
              className
            )}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={context.variants}
            style={{
              position: context.isMobile ? 'relative' : 'absolute',
              maxWidth: context.isMobile ? 'calc(100% - 2rem)' : 'none',
            }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent }
