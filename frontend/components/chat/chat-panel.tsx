"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, PanelLeft, PanelRight, Sparkles } from "lucide-react";

import { Composer, type ComposerHandle } from "@/components/chat/composer";
import { MessageItem } from "@/components/chat/message-item";
import { Welcome } from "@/components/chat/welcome";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import type { ChatController } from "@/hooks/use-chat";
import { MODEL_NAME } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  chat: ChatController;
  sidebarOpen: boolean;
  insightsOpen: boolean;
  onToggleInsights: () => void;
  onOpenSidebar: () => void;
}

export function ChatPanel({
  chat,
  sidebarOpen,
  insightsOpen,
  onToggleInsights,
  onOpenSidebar,
}: ChatPanelProps) {
  const composerRef = React.useRef<ComposerHandle>(null);
  const { messages, status, isBusy, notice, send, stop, regenerate } = chat;

  const streamTick = messages.at(-1)?.content.length ?? 0;
  const { ref, pinned, onScroll, scrollToBottom } =
    useAutoScroll<HTMLDivElement>(`${messages.length}:${streamTick}`);

  const empty = messages.length === 0;

  return (
    <section className="relative flex min-w-0 flex-1 flex-col">
      <header className="relative z-10 flex h-16 shrink-0 items-center gap-3 px-5">
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(sidebarOpen && "lg:hidden")}
          onClick={onOpenSidebar}
          aria-label="Open conversations"
        >
          <PanelLeft className="size-4" />
        </Button>

        <h2 className="min-w-0 flex-1 truncate text-[14px] font-medium text-foreground/90">
          {chat.activeConversation?.title ?? "New conversation"}
        </h2>

        <span className="hidden items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-[12px] font-medium text-primary sm:flex">
          <Sparkles className="size-3" />
          {MODEL_NAME}
          <span
            className={cn(
              "ml-0.5 size-1.5 rounded-full",
              isBusy ? "animate-pulse bg-accent" : "bg-signal",
            )}
          />
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleInsights}
              aria-label={insightsOpen ? "Hide insights" : "Show insights"}
              className={cn(insightsOpen && "text-foreground")}
            >
              <PanelRight className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {insightsOpen ? "Hide insights" : "Show insights"}
          </TooltipContent>
        </Tooltip>
      </header>

      <div
        ref={ref}
        onScroll={onScroll}
        className="scroll-slim relative flex-1 overflow-y-auto overscroll-contain"
      >
        <div
          className={cn(
            "mx-auto w-full max-w-3xl px-6",
            empty ? "flex min-h-full items-center" : "space-y-8 py-10",
          )}
        >
          {empty ? (
            <Welcome onPick={(prompt) => composerRef.current?.setValue(prompt)} />
          ) : (
            messages.map((message, index) => (
              <MessageItem
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
                busy={isBusy}
                onRegenerate={regenerate}
              />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {!pinned && !empty && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            className="pointer-events-none absolute inset-x-0 bottom-36 z-10 flex justify-center"
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={() => scrollToBottom()}
              className="pointer-events-auto rounded-full backdrop-blur-xl"
            >
              <ArrowDown className="size-3.5" />
              Jump to latest
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Composer
        ref={composerRef}
        status={status}
        notice={notice}
        onSend={send}
        onStop={stop}
      />
    </section>
  );
}
