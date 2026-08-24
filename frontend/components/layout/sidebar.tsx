"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LogOut,
  MessageSquare,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ChatController } from "@/hooks/use-chat";
import { APP_NAME } from "@/lib/api";
import type { Conversation } from "@/lib/types";
import { cn, formatRelativeDay } from "@/lib/utils";

interface SidebarProps {
  chat: ChatController;
  onCollapse?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ chat, onCollapse, onNavigate }: SidebarProps) {
  const [query, setQuery] = React.useState("");

  const groups = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = chat.conversations.filter((conv) => {
      if (!term) return true;
      if (conv.title.toLowerCase().includes(term)) return true;
      return conv.messages.some((m) => m.content.toLowerCase().includes(term));
    });

    const ordered = [...matches].sort((a, b) => b.updatedAt - a.updatedAt);
    const buckets = new Map<string, Conversation[]>();
    for (const conv of ordered) {
      const key = formatRelativeDay(conv.updatedAt);
      const list = buckets.get(key);
      if (list) list.push(conv);
      else buckets.set(key, [conv]);
    }
    return [...buckets.entries()];
  }, [chat.conversations, query]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow">
          <Sparkles className="size-4 text-white" />
        </span>
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          {APP_NAME}
        </span>

        {onCollapse && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto hidden lg:inline-flex"
                onClick={onCollapse}
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Collapse sidebar</TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="space-y-3 px-4 pb-4">
        <button
          type="button"
          onClick={() => {
            chat.newConversation();
            onNavigate?.();
          }}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[hsl(255_88%_74%)] text-[14px] font-medium text-primary-foreground shadow-glow transition-all duration-200 hover:brightness-110 active:scale-[0.99]"
        >
          <Plus className="size-4" />
          New chat
        </button>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="surface h-11 w-full rounded-xl pl-10 pr-3 text-[14px] text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-primary/35 focus:outline-none"
          />
        </div>
      </div>

      <nav
        aria-label="Conversation history"
        className="scroll-slim min-h-0 flex-1 overflow-y-auto px-3 pb-4"
      >
        {groups.length === 0 ? (
          <p className="px-3 py-10 text-center text-[13.5px] leading-relaxed text-muted-foreground">
            Nothing matches “{query}”. Try another word, or start a new chat.
          </p>
        ) : (
          groups.map(([label, items]) => (
            <div key={label} className="mb-5">
              <p className="eyebrow px-3 pb-2 pt-1">{label}</p>
              <ul className="space-y-1">
                <AnimatePresence initial={false}>
                  {items.map((conv) => (
                    <motion.li
                      key={conv.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ConversationRow
                        conversation={conv}
                        active={conv.id === chat.activeId}
                        onSelect={() => {
                          chat.selectConversation(conv.id);
                          onNavigate?.();
                        }}
                        onDelete={() => chat.deleteConversation(conv.id)}
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          ))
        )}
      </nav>

      <div className="shrink-0 p-4 pt-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="surface surface-hover flex w-full items-center gap-3 rounded-xl p-3 text-left"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[12px] font-semibold text-white">
                AE
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium text-foreground">
                  AI Engineer
                </span>
                <span className="block truncate text-[12px] text-muted-foreground">
                  Pro workspace
                </span>
              </span>
              <span className="size-2 shrink-0 rounded-full bg-signal shadow-[0_0_8px_hsl(var(--signal)/0.8)]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-60">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem>
              <Settings /> Preferences
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare /> Conversation style
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => chat.clearAll()}
              className="text-destructive/90 focus:text-destructive [&_svg]:text-destructive/70"
            >
              <Trash2 /> Delete all conversations
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ConversationRow({
  conversation,
  active,
  onSelect,
  onDelete,
}: {
  conversation: Conversation;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-1 rounded-xl border pr-1 transition-all duration-200",
        active
          ? "border-white/[0.09] bg-white/[0.06]"
          : "border-transparent hover:bg-white/[0.04]",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left"
      >
        <MessageSquare
          className={cn(
            "size-4 shrink-0 transition-colors",
            active ? "text-primary" : "text-muted-foreground/70",
          )}
        />
        <span
          className={cn(
            "truncate text-[14px] transition-colors",
            active ? "text-foreground" : "text-foreground/75 group-hover:text-foreground",
          )}
        >
          {conversation.title}
        </span>
      </button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete ${conversation.title}`}
        onClick={onDelete}
        className="shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
