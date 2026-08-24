"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Cpu,
  Layers,
  Timer,
  X,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ChatController } from "@/hooks/use-chat";
import { API_URL, MODEL_NAME } from "@/lib/api";
import type { RequestMetric } from "@/lib/types";
import { cn, estimateTokens, formatDuration, formatTime } from "@/lib/utils";

interface InsightsPanelProps {
  chat: ChatController;
  onCollapse?: () => void;
}

export function InsightsPanel({ chat, onCollapse }: InsightsPanelProps) {
  const { metrics, conversations, session, status } = chat;

  const summary = React.useMemo(() => summarise(metrics), [metrics]);

  const tokens = React.useMemo(() => {
    let input = 0;
    let output = 0;
    for (const conv of conversations) {
      for (const message of conv.messages) {
        const count = estimateTokens(message.content);
        if (message.role === "user") input += count;
        else output += count;
      }
    }
    return { input, output, total: input + output };
  }, [conversations]);

  const messageCount = conversations.reduce(
    (sum, conv) => sum + conv.messages.length,
    0,
  );

  const promptShare = tokens.total ? (tokens.input / tokens.total) * 100 : 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <Activity className="size-4 text-primary" />
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          Insights
        </span>
        {onCollapse && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onCollapse}
            aria-label="Hide insights"
            className="ml-auto"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div className="scroll-slim min-h-0 flex-1 space-y-6 overflow-y-auto px-5 pb-6">
        {/* Requests */}
        <section className="space-y-2.5">
          <h3 className="eyebrow">Request metrics</h3>
          <div className="grid grid-cols-2 gap-2.5">
            <MetricCard
              icon={Zap}
              label="Requests"
              value={String(summary.total)}
              caption={`${summary.failures} ${summary.failures === 1 ? "error" : "errors"}`}
              tone={summary.failures > 0 ? "warn" : "default"}
            />
            <MetricCard
              icon={Timer}
              label="Avg latency"
              value={summary.average ? formatDuration(summary.average) : "0.00s"}
              caption="per response"
            />
          </div>
          {metrics.length > 0 && <Sparkline metrics={metrics} />}
        </section>

        {/* Tokens */}
        <section className="space-y-2.5">
          <h3 className="eyebrow">Token usage</h3>
          <div className="surface space-y-3 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[28px] font-semibold leading-none tracking-[-0.02em] text-foreground">
                  {format(tokens.total)}
                </p>
                <p className="mt-1.5 text-[12px] text-muted-foreground">
                  estimated total tokens
                </p>
              </div>
              <Activity className="size-4 text-accent/70" />
            </div>

            <div className="flex h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="bg-primary"
                animate={{ width: `${promptShare}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.div
                className="bg-accent"
                animate={{ width: `${tokens.total ? 100 - promptShare : 0}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            <div className="flex items-center justify-between text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" />
                Prompt {format(tokens.input)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-accent" />
                Completion {format(tokens.output)}
              </span>
            </div>
          </div>
        </section>

        {/* Model */}
        <section className="space-y-2.5">
          <h3 className="eyebrow">Model</h3>
          <div className="surface divide-y divide-white/[0.05] rounded-2xl px-4">
            <Row
              label="Engine"
              value={
                <span className="flex items-center gap-1.5">
                  <Cpu className="size-3.5 text-primary" />
                  {MODEL_NAME}
                </span>
              }
            />
            <Row label="Source" value={hostOf(API_URL)} />
            <Row
              label="Streaming"
              value={
                summary.total === 0
                  ? "Ready"
                  : summary.streamed
                    ? "Live"
                    : "Buffered"
              }
            />
          </div>
        </section>

        {/* Session */}
        <section className="space-y-2.5">
          <h3 className="eyebrow">Session</h3>
          <div className="surface divide-y divide-white/[0.05] rounded-2xl px-4">
            <Row label="Messages" value={String(messageCount)} />
            <Row
              label="Started"
              value={session.startedAt ? formatTime(session.startedAt) : "—"}
            />
            <Row
              label="Session ID"
              value={
                <span className="font-mono text-[12px]">
                  {session.id ? session.id.replace("sess_", "") : "—"}
                </span>
              }
            />
            <Row
              label="State"
              value={
                <span
                  className={cn(
                    "flex items-center gap-1.5",
                    status === "idle" ? "text-muted-foreground" : "text-accent",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      status === "idle" ? "bg-signal" : "animate-pulse bg-accent",
                    )}
                  />
                  {status === "idle" ? "Ready" : status}
                </span>
              }
            />
          </div>
        </section>

        {/* Roadmap */}
        <section className="space-y-2.5">
          <h3 className="eyebrow">Coming soon</h3>
          <div className="surface flex items-start gap-3 rounded-2xl p-4">
            <Layers className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Tool calls, sources, and retrieval context will surface here.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── pieces ───────────────────────────────────────────────────────────────*/

function MetricCard({
  icon: Icon,
  label,
  value,
  caption,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  caption: string;
  tone?: "default" | "warn";
}) {
  return (
    <div className="surface rounded-2xl p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" />
        <span className="text-[11px] font-medium uppercase tracking-label">
          {label}
        </span>
      </div>
      <p className="mt-2.5 text-[24px] font-semibold leading-none tracking-[-0.02em] text-foreground">
        {value}
      </p>
      <p
        className={cn(
          "mt-1.5 text-[12px]",
          tone === "warn" ? "text-destructive/80" : "text-muted-foreground",
        )}
      >
        {caption}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-[13.5px] text-muted-foreground">{label}</span>
      <span className="truncate text-[13.5px] font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

function Sparkline({ metrics }: { metrics: RequestMetric[] }) {
  const recent = metrics.slice(-20);
  const peak = Math.max(1, ...recent.map((m) => m.latencyMs));

  return (
    <div className="surface flex h-14 items-end gap-1 rounded-2xl px-3 py-3">
      {recent.map((metric) => (
        <motion.span
          key={metric.id}
          initial={{ height: 2, opacity: 0 }}
          animate={{
            height: `${Math.max(10, (metric.latencyMs / peak) * 100)}%`,
            opacity: 1,
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          title={
            metric.ok
              ? `${formatDuration(metric.latencyMs)} · ${formatTime(metric.at)}`
              : `Failed · ${formatTime(metric.at)}`
          }
          className={cn(
            "min-w-[3px] flex-1 rounded-full",
            metric.ok
              ? "bg-gradient-to-t from-primary/35 to-primary"
              : "bg-destructive/70",
          )}
        />
      ))}
    </div>
  );
}

/* ── helpers ──────────────────────────────────────────────────────────────*/

function summarise(metrics: RequestMetric[]) {
  const ok = metrics.filter((m) => m.ok);
  const average =
    ok.length > 0
      ? ok.reduce((sum, m) => sum + m.latencyMs, 0) / ok.length
      : 0;

  return {
    total: metrics.length,
    failures: metrics.length - ok.length,
    average,
    streamed: metrics.at(-1)?.streamed ?? false,
  };
}

function format(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
}

function hostOf(url: string) {
  try {
    const host = new URL(url).host;
    return host.startsWith("localhost") ? "Local preview" : host;
  } catch {
    return url;
  }
}
