"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ChatPanel } from "@/components/chat/chat-panel";
import { InsightsPanel } from "@/components/layout/insights-panel";
import { Sidebar } from "@/components/layout/sidebar";
import { Dialog, DialogPanel, DialogTitle } from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useChat } from "@/hooks/use-chat";
import { useMediaQuery } from "@/hooks/use-media-query";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function AppShell() {
  const chat = useChat();

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isWide = useMediaQuery("(min-width: 1280px)");

  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [insightsOpen, setInsightsOpen] = React.useState(true);
  const [mobileNav, setMobileNav] = React.useState(false);
  const [mobileInsights, setMobileInsights] = React.useState(false);

  // ⌘B conversations · ⌘I insights · ⌘⇧O new chat
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!event.metaKey && !event.ctrlKey) return;
      const key = event.key.toLowerCase();
      if (key === "b") {
        event.preventDefault();
        if (isDesktop) setSidebarOpen((v) => !v);
        else setMobileNav((v) => !v);
      } else if (key === "i") {
        event.preventDefault();
        if (isWide) setInsightsOpen((v) => !v);
        else setMobileInsights((v) => !v);
      } else if (key === "o" && event.shiftKey) {
        event.preventDefault();
        chat.newConversation();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chat, isDesktop, isWide]);

  const toggleInsights = () => {
    if (isWide) setInsightsOpen((v) => !v);
    else setMobileInsights(true);
  };

  const openSidebar = () => {
    if (isDesktop) setSidebarOpen(true);
    else setMobileNav(true);
  };

  return (
    <TooltipProvider delayDuration={350} skipDelayDuration={200}>
      <div className="relative flex h-dvh w-full overflow-hidden bg-background text-foreground">
        <Ambient />

        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="relative z-20 hidden shrink-0 overflow-hidden border-r border-white/[0.06] bg-[hsl(230_20%_6%)] lg:block"
            >
              <div className="h-full w-[300px]">
                <Sidebar chat={chat} onCollapse={() => setSidebarOpen(false)} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <motion.main
          layout
          transition={{ duration: 0.4, ease: EASE }}
          className="relative z-10 flex min-w-0 flex-1"
        >
          <ChatPanel
            chat={chat}
            sidebarOpen={sidebarOpen}
            insightsOpen={insightsOpen}
            onToggleInsights={toggleInsights}
            onOpenSidebar={openSidebar}
          />

          <AnimatePresence initial={false}>
            {insightsOpen && (
              <motion.aside
                key="insights"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 340, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="hidden shrink-0 overflow-hidden border-l border-white/[0.06] bg-[hsl(230_20%_6%)] xl:block"
              >
                <div className="h-full w-[340px]">
                  <InsightsPanel
                    chat={chat}
                    onCollapse={() => setInsightsOpen(false)}
                  />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </motion.main>

        <Dialog open={mobileNav} onOpenChange={setMobileNav}>
          <DialogPanel side="left" className="lg:hidden">
            <DialogTitle className="sr-only">Conversations</DialogTitle>
            <Sidebar chat={chat} onNavigate={() => setMobileNav(false)} />
          </DialogPanel>
        </Dialog>

        <Dialog open={mobileInsights} onOpenChange={setMobileInsights}>
          <DialogPanel side="right" className="xl:hidden">
            <DialogTitle className="sr-only">Insights</DialogTitle>
            <InsightsPanel chat={chat} />
          </DialogPanel>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

/** A single light source behind the chat column. Nothing else. */
function Ambient() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute left-1/2 top-[-12rem] size-[42rem] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-[160px]" />
    </div>
  );
}
