"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { Markdown } from "@/components/chat/markdown";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopy } from "@/hooks/use-copy";
import type { Message } from "@/lib/types";
import { cn, formatDuration, formatTime } from "@/lib/utils";

interface MessageItemProps {
  message: Message;
  isLast: boolean;
  busy: boolean;
  onRegenerate: () => void;
}

export function MessageItem({
  message,
  isLast,
  busy,
  onRegenerate,
}: MessageItemProps) {
  const { copied, copy } = useCopy();
  const isUser = message.role === "user";
  const thinking =
    message.status === "streaming" && message.content.length === 0;
  const streaming =
    message.status === "streaming" && message.content.length > 0;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn("group flex w-full gap-3.5", isUser && "justify-end")}
    >
      {!isUser && (
        <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-primary/25 to-accent/15">
          <Sparkles className="size-3.5 text-primary" />
        </span>
      )}

      <div
        className={cn(
          "flex min-w-0 flex-col gap-2",
          isUser ? "max-w-[min(85%,36rem)] items-end" : "w-full",
        )}
      >
        {isUser ? (
          <div className="rounded-2xl rounded-br-md border border-primary/25 bg-primary/[0.14] px-5 py-3 text-[15.5px] leading-relaxed text-foreground">
            <p className="whitespace-pre-wrap text-pretty">{message.content}</p>
          </div>
        ) : (
          <div
            className={cn(
              "surface rounded-2xl rounded-tl-md px-6 py-5",
              message.status === "error" &&
                "border-destructive/25 bg-destructive/[0.05]",
            )}
          >
            {thinking ? (
              <TypingDots />
            ) : (
              <>
                {message.content && (
                  <Markdown
                    content={
                      streaming ? `${message.content}\u2009▍` : message.content
                    }
                  />
                )}
                {message.status === "error" && (
                  <div
                    className={cn(
                      "flex items-start gap-2.5 text-[13.5px] leading-relaxed text-destructive/90",
                      message.content &&
                        "mt-4 border-t border-destructive/20 pt-4",
                    )}
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <div className="space-y-3">
                      <p className="text-pretty">{message.error}</p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={onRegenerate}
                        disabled={busy}
                      >
                        <RefreshCw className="size-3.5" />
                        Try again
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div
          className={cn(
            "flex items-center gap-2 px-1 text-[12px] text-muted-foreground/80",
            isUser ? "flex-row-reverse" : "flex-row",
          )}
        >
          <time dateTime={new Date(message.createdAt).toISOString()}>
            {formatTime(message.createdAt)}
          </time>

          {!isUser && message.latencyMs ? (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span>{formatDuration(message.latencyMs)}</span>
            </>
          ) : null}

          {!isUser && message.status === "complete" && message.content ? (
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
              <Action
                label={copied ? "Copied" : "Copy reply"}
                onClick={() => void copy(message.content)}
              >
                {copied ? (
                  <Check className="size-3.5 text-signal" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Action>
              {isLast && (
                <Action label="Regenerate" onClick={onRegenerate} disabled={busy}>
                  <RefreshCw className="size-3.5" />
                </Action>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1" role="status" aria-live="polite">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-2 animate-dot-pulse rounded-full bg-primary"
          style={{ animationDelay: `${index * 0.16}s` }}
        />
      ))}
      <span className="sr-only">Waiting for a reply</span>
    </div>
  );
}

function Action({
  label,
  children,
  onClick,
  disabled,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.07] hover:text-foreground disabled:opacity-40"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
