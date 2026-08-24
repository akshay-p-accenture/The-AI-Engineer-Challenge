"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "./ui/button"
import { Tooltip } from "./ui/tooltip"
import { cn, formatRelative } from "@/lib/utils"
import type { Conversation } from "@/lib/types"

interface SidebarProps {
  conversations: Conversation[]
  activeId: string
  open: boolean
  onClose: () => void
  onNew: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function Sidebar({
  conversations,
  activeId,
  open,
  onClose,
  onNew,
  onSelect,
  onDelete,
}: SidebarProps) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)
    if (!q) return list
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q)),
    )
  }, [conversations, query])

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-[280px] flex-col gap-3 p-3",
          "glass-strong border-r border-border",
          "lg:relative lg:z-auto lg:translate-x-0",
          !open && "lg:hidden",
        )}
        aria-label="Conversation history"
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-gradient-to-br from-primary/30 to-accent/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Aurora</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New chat */}
        <Button onClick={onNew} className="w-full justify-start" size="md">
          <Plus className="h-4 w-4" />
          New chat
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="h-10 w-full rounded-xl border border-border bg-surface/60 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring/60 focus:outline-none"
          />
        </div>

        {/* History */}
        <div className="scroll-thin -mr-1 flex-1 space-y-1 overflow-y-auto pr-1">
          <p className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Recent
          </p>
          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                No conversations found.
              </p>
            ) : (
              filtered.map((c) => {
                const isActive = c.id === activeId
                return (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group relative"
                  >
                    <button
                      onClick={() => {
                        onSelect(c.id)
                        onClose()
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                        isActive
                          ? "bg-surface-elevated text-foreground"
                          : "text-foreground/70 hover:bg-surface hover:text-foreground",
                      )}
                    >
                      <MessageSquare
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {c.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-0">
                        {formatRelative(new Date(c.updatedAt))}
                      </span>
                    </button>
                    <Tooltip label="Delete">
                      <button
                        onClick={() => onDelete(c.id)}
                        aria-label={`Delete ${c.title}`}
                        className="absolute right-1.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-red-500/15 hover:text-red-400 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </Tooltip>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 p-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground">
            AE
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">AI Engineer</p>
            <p className="truncate text-[11px] text-muted-foreground">
              Pro workspace
            </p>
          </div>
          <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px] shadow-accent" />
        </div>
      </motion.aside>
    </>
  )
}
