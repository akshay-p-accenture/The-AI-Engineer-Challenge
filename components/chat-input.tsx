"use client"

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type FormEvent,
} from "react"
import { ArrowUp, Square } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (text: string) => void
  onStop: () => void
  isSending: boolean
  autoFocusKey?: string
  seed?: { text: string; nonce: number }
}

export function ChatInput({
  onSend,
  onStop,
  isSending,
  autoFocusKey,
  seed,
}: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  // Refocus when switching conversation
  useEffect(() => {
    textareaRef.current?.focus()
  }, [autoFocusKey])

  // Allow parent to seed the composer (e.g. suggested prompts)
  useEffect(() => {
    if (seed?.text) {
      setValue(seed.text)
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed?.nonce])

  const submit = () => {
    const text = value.trim()
    if (!text || isSending) return
    onSend(text)
    setValue("")
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Respect IME composition (CJK) and Safari's 229 keyCode quirk
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      e.keyCode !== 229
    ) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={cn(
          "glass-strong flex items-end gap-2 rounded-2xl p-2 pl-4 shadow-2xl shadow-black/30 transition-colors",
          "focus-within:border-ring/60",
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Message Aurora…"
          aria-label="Message input"
          className="scroll-thin max-h-[200px] flex-1 resize-none bg-transparent py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        {isSending ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            className="mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-foreground transition-colors hover:bg-surface active:scale-95"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim()}
            aria-label="Send message"
            className={cn(
              "mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all active:scale-95",
              value.trim()
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90"
                : "bg-surface-elevated text-muted-foreground",
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Aurora can make mistakes. Consider verifying important information.
      </p>
    </form>
  )
}
