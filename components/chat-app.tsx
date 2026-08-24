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

  // Collapse side panels by default on smaller screens
  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.innerWidth < 1024) setSidebarOpen(false)
    if (window.innerWidth < 1280) setInsightsOpen(false)
  }, [])

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
