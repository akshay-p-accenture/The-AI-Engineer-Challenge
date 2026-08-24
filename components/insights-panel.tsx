"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  Cpu,
  Gauge,
  Layers,
  Timer,
  X,
  Zap,
} from "lucide-react"
import { USING_MOCK } from "@/lib/api"
import type { Conversation, SessionMetrics } from "@/lib/types"

interface InsightsPanelProps {
  open: boolean
  onClose: () => void
  metrics: SessionMetrics
  active: Conversation
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="glass rounded-xl p-3.5">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

export function InsightsPanel({
  open,
  onClose,
  metrics,
  active,
}: InsightsPanelProps) {
  const totalTokens = metrics.promptTokens + metrics.completionTokens
  const avgLatency =
    metrics.requests > 0
      ? (metrics.totalLatencyMs / metrics.requests / 1000).toFixed(2)
      : "0.00"

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
          className="relative z-20 hidden shrink-0 overflow-hidden border-l border-border xl:block"
        >
          <div className="scroll-thin h-full w-[320px] overflow-y-auto p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold tracking-tight">
                  Insights
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close insights panel"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Request metrics */}
            <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Request metrics
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard
                icon={Zap}
                label="Requests"
                value={String(metrics.requests)}
                sub={`${metrics.errors} errors`}
              />
              <StatCard
                icon={Timer}
                label="Avg latency"
                value={`${avgLatency}s`}
                sub="per response"
              />
            </div>

            {/* Token usage */}
            <p className="mb-2 mt-5 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Token usage
            </p>
            <div className="glass rounded-xl p-4">
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {totalTokens.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    estimated total tokens
                  </p>
                </div>
                <Gauge className="h-5 w-5 text-accent" />
              </div>
              <div className="mb-1.5 flex h-2 overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${
                      totalTokens
                        ? (metrics.promptTokens / totalTokens) * 100
                        : 0
                    }%`,
                  }}
                />
                <div
                  className="h-full bg-accent"
                  style={{
                    width: `${
                      totalTokens
                        ? (metrics.completionTokens / totalTokens) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Prompt {metrics.promptTokens.toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  Completion {metrics.completionTokens.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Model info */}
            <p className="mb-1 mt-5 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Model
            </p>
            <div className="glass rounded-xl px-4 py-1.5">
              <Row
                label="Engine"
                value={
                  <span className="flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-primary" />
                    GPT
                  </span>
                }
              />
              <div className="h-px bg-border" />
              <Row
                label="Source"
                value={USING_MOCK ? "Local preview" : "FastAPI"}
              />
              <div className="h-px bg-border" />
              <Row label="Streaming" value="Ready" />
            </div>

            {/* Session info */}
            <p className="mb-1 mt-5 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Session
            </p>
            <div className="glass rounded-xl px-4 py-1.5">
              <Row label="Messages" value={active.messages.length} />
              <div className="h-px bg-border" />
              <Row
                label="Started"
                value={new Date(active.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
              <div className="h-px bg-border" />
              <Row
                label="Session ID"
                value={
                  <span className="font-mono text-xs">
                    {active.id.slice(0, 8)}
                  </span>
                }
              />
            </div>

            {/* Future extensibility */}
            <p className="mb-2 mt-5 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Coming soon
            </p>
            <div className="glass flex items-center gap-3 rounded-xl border-dashed p-4 text-muted-foreground">
              <Layers className="h-4 w-4 shrink-0" />
              <p className="text-xs leading-relaxed">
                Tool calls, sources, and retrieval context will surface here.
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
