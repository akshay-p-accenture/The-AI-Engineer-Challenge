"use client"

import { useEffect, useState } from "react"
import { TooltipProvider } from "./ui/tooltip"
import { Sidebar } from "./sidebar"
import { ChatPanel } from "./chat-panel"
import { InsightsPanel } from "./insights-panel"
import { useChat } from "@/lib/use-chat"

export function ChatApp() {
  const chat = useChat()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [insightsOpen, setInsightsOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Collapse side panels by default on smaller screens, and defer the first
  // render to the client. The app is built entirely from ephemeral client
  // state (timestamps, ids) that cannot be reproduced deterministically on the
  // server, so we render a static shell during SSR to avoid hydration drift.
  useEffect(() => {
    setMounted(true)
    if (typeof window === "undefined") return
    if (window.innerWidth < 1024) setSidebarOpen(false)
    if (window.innerWidth < 1280) setInsightsOpen(false)
  }, [])

  if (!mounted) {
    return (
      <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-background text-foreground">
        <div className="app-aurora" aria-hidden />
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-gradient-to-br from-primary/40 to-accent/30" />
          <span className="text-xs text-muted-foreground">Loading Aurora…</span>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={250}>
      <div className="relative flex h-[100dvh] w-full overflow-hidden bg-background text-foreground">
        {/* Ambient background */}
        <div className="app-aurora" aria-hidden />

        <Sidebar
          conversations={chat.conversations}
          activeId={chat.activeId}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNew={chat.newConversation}
          onSelect={chat.selectConversation}
          onDelete={chat.deleteConversation}
        />

        <ChatPanel
          conversation={chat.active}
          isSending={chat.isSending}
          onSend={chat.send}
          onStop={chat.stop}
          onRegenerate={chat.regenerate}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onToggleInsights={() => setInsightsOpen((v) => !v)}
          insightsOpen={insightsOpen}
        />

        <InsightsPanel
          open={insightsOpen}
          onClose={() => setInsightsOpen(false)}
          metrics={chat.metrics}
          active={chat.active}
        />
      </div>
    </TooltipProvider>
  )
}
