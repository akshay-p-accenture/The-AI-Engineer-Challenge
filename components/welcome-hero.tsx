"use client"

import { motion } from "framer-motion"
import { Compass, Lightbulb, PenLine, Sparkles } from "lucide-react"

const SUGGESTIONS = [
  {
    icon: Lightbulb,
    title: "Explain a concept",
    prompt: "Explain object-oriented programming in simple terms to a beginner.",
  },
  {
    icon: PenLine,
    title: "Write something",
    prompt:
      "Write a short, imaginative story about a robot finding friendship in an unexpected place.",
  },
  {
    icon: Compass,
    title: "Think it through",
    prompt: "I'm feeling overwhelmed with my workload. Help me create a plan.",
  },
  {
    icon: Sparkles,
    title: "Show me code",
    prompt: "Write a React hook for debouncing a value, with an explanation.",
  },
]

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export function WelcomeHero({
  onSelect,
}: {
  onSelect: (prompt: string) => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-10">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-2xl"
      >
        <motion.div variants={item} className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/30 to-accent/20 shadow-xl shadow-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            <span className="text-gradient">How can I help you today?</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Ask anything, brainstorm ideas, or work through a problem. Aurora is
            here to think alongside you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => {
            const Icon = s.icon
            return (
              <motion.button
                key={s.title}
                variants={item}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(s.prompt)}
                className="glass group flex flex-col gap-2 rounded-2xl p-4 text-left transition-colors hover:border-border-strong"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-primary transition-colors group-hover:text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {s.title}
                </span>
                <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {s.prompt}
                </span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
