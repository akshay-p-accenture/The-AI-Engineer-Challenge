"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, Check, Copy, RefreshCw, Sparkles, User } from "lucide-react"
import { Markdown } from "./markdown"
import { TypingIndicator } from "./typing-indicator"
import { Tooltip } from "./ui/tooltip"
import { cn, formatTime } from "@/lib/utils"
import type { Message } from "@/lib/types"

interface MessageBubbleProps {
  message: Message
  isPending: boolean
  isLastAssistant: boolean
  canRegenerate: boolean
  onRegenerate: () => void
}

export function MessageBubble({
  message,
  isPending,
  isLastAssistant,
  canRegenerate,
  onRegenerate,
}: MessageBubbleProps) {
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* noop */
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group flex w-full gap-3.5 md:gap-4",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
          isUser
            ? "border-border-strong bg-surface-elevated"
            : "border-primary/30 bg-gradient-to-br from-primary/30 to-accent/20",
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Sparkles className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Content column */}
      <div
        className={cn(
          "flex min-w-0 max-w-[calc(100%-3.5rem)] flex-col gap-1.5",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-medium text-foreground/70">
            {isUser ? "You" : "Aurora"}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {formatTime(new Date(message.createdAt))}
          </span>
        </div>

        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "glass-strong rounded-tr-md text-foreground"
              : message.error
                ? "border border-red-500/25 bg-red-500/10 rounded-tl-md text-foreground"
                : "glass rounded-tl-md text-foreground/95",
          )}
        >
          {isPending && !message.content ? (
            <TypingIndicator />
          ) : message.error ? (
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <span>{message.content}</span>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <Markdown content={message.content} />
          )}
        </div>

        {/* Action row for assistant messages */}
        {!isUser && !isPending && message.content && (
          <div className="flex items-center gap-1 px-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
            <Tooltip label={copied ? "Copied" : "Copy"}>
              <button
                onClick={copy}
                aria-label="Copy response"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-accent" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </Tooltip>
            {isLastAssistant && canRegenerate && (
              <Tooltip label="Regenerate">
                <button
                  onClick={onRegenerate}
                  aria-label="Regenerate response"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
            {message.latencyMs != null && (
              <span className="ml-1 text-[11px] text-muted-foreground">
                {(message.latencyMs / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
