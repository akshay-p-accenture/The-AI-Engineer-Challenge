"use client";

import { motion, type Variants } from "framer-motion";
import { Compass, Lightbulb, Moon, PenLine, Sparkles } from "lucide-react";

import { APP_NAME } from "@/lib/api";

const STARTERS = [
  {
    icon: Lightbulb,
    title: "Reset the week",
    prompt:
      "Help me shake off a rough week and start Monday with a clear head.",
  },
  {
    icon: PenLine,
    title: "Talk down the nerves",
    prompt:
      "I present to the exec team tomorrow and I keep rehearsing the worst version of it.",
  },
  {
    icon: Compass,
    title: "Think it through",
    prompt:
      "There's one task I keep avoiding. Walk me through what's actually in the way.",
  },
  {
    icon: Moon,
    title: "Wind down",
    prompt: "Build me a ten-minute routine for closing out the workday.",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Welcome({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-3xl flex-col items-center px-2 py-12 text-center"
    >
      <motion.div
        variants={item}
        className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-primary/30 to-accent/15 shadow-glow"
      >
        <Sparkles className="size-6 text-primary" />
      </motion.div>

      <motion.h1
        variants={item}
        className="gradient-text mt-8 text-balance text-[2rem] font-semibold leading-[1.15] tracking-[-0.025em] sm:text-[2.6rem]"
      >
        How can I help you today?
      </motion.h1>

      <motion.p
        variants={item}
        className="mt-4 max-w-lg text-pretty text-[15px] leading-relaxed text-muted-foreground"
      >
        Say what&apos;s on your mind, work through a decision, or just think out
        loud. {APP_NAME} is here to think alongside you.
      </motion.p>

      <motion.div
        variants={item}
        className="mt-12 grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {STARTERS.map((starter) => (
          <button
            key={starter.title}
            type="button"
            onClick={() => onPick(starter.prompt)}
            className="surface surface-hover group flex h-full flex-col items-start gap-3 rounded-2xl p-5 text-left hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-primary transition-colors group-hover:border-primary/30 group-hover:bg-primary/10">
              <starter.icon className="size-4" />
            </span>
            <span className="text-[15px] font-medium text-foreground">
              {starter.title}
            </span>
            <span className="text-pretty text-[13.5px] leading-relaxed text-muted-foreground">
              {starter.prompt}
            </span>
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
}
