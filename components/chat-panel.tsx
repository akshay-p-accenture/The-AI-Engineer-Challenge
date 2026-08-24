"use client"

import { useEffect, useRef, useState } from "react"
import { PanelLeft, PanelRight, Wifi, WifiOff } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { MessageBubble } from "./message-bubble"
import { WelcomeHero } from "./welcome-hero"
import { ChatInput } from "./chat-input"
import { Tooltip } from "./ui/tooltip"
import { USING_MOCK } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/lib/types"

interface ChatPanelProps {
  conversation: Conversation
  isSending: boolean
  onSend: (text: string) => void
  onStop: () => void
  onRegenerate: () => void
  onToggleSidebar: () => void
  onToggleInsights: () => void
  insightsOpen: boolean
}

export function ChatPanel({
  conversation,
  isSending,
  onSend,
  onStop,
  onRegenerate,
  onToggleSidebar,
  onToggleInsights,
  insightsOpen,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [seed, setSeed] = useState<{ text: string; nonce: number } | undefined>()

  const isEmpty = conversation.messages.length === 0
  const lastAssistantIndex = conversation.messages
    .map((m) => m.role)
    .lastIndexOf("assistant")

  // Auto-scroll to bottom on new messages / streaming
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [conversation.messages, isSending])

  const handleSuggestion = (prompt: string) => {
    setSeed({ text: prompt, nonce: Date.now() })
  }

  return (
    <main className="relative z-10 flex h-full min-w-0 flex-1 flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3 md:px-4">
        <div className="flex items-center gap-2">
          <Tooltip label="Toggle sidebar">
            <button
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </Tooltip>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-medium">
              {conversation.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:flex",
              USING_MOCK
                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border-accent/30 bg-accent/10 text-accent",
            )}
          >
            {USING_MOCK ? (
              <>
                <WifiOff className="h-3 w-3" /> Preview
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3" /> Connected
              </>
            )}
          </div>
          <Tooltip label={insightsOpen ? "Hide insights" : "Show insights"}>
            <button
              onClick={onToggleInsights}
              aria-label="Toggle insights panel"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                insightsOpen
                  ? "bg-surface-elevated text-foreground"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground",
              )}
            >
              <PanelRight className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="scroll-thin flex-1 overflow-y-auto"
      >
        {isEmpty ? (
          <WelcomeHero onSelect={handleSuggestion} />
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-6">
            <AnimatePresence initial={false}>
              {conversation.messages.map((message, i) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isPending={
                    isSending &&
                    i === conversation.messages.length - 1 &&
                    message.role === "assistant"
                  }
                  isLastAssistant={i === lastAssistantIndex}
                  canRegenerate={!isSending}
                  onRegenerate={onRegenerate}
                />
              ))}
            </AnimatePresence>
            <div ref={bottomRef} className="h-px" />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 px-4 pb-4 md:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <ChatInput
            onSend={onSend}
            onStop={onStop}
            isSending={isSending}
            autoFocusKey={conversation.id}
            seed={seed}
          />
        </div>
      </div>
    </main>
  )
}
