import { NextResponse } from "next/server"

/**
 * Local preview fallback that mirrors the FastAPI contract:
 *   POST { message: string }  ->  { reply: string }
 *
 * In production, set NEXT_PUBLIC_API_URL to your deployed FastAPI backend
 * and requests will go to `${NEXT_PUBLIC_API_URL}/api/chat` instead.
 */
export async function POST(req: Request) {
  let message = ""
  try {
    const body = await req.json()
    message = typeof body?.message === "string" ? body.message : ""
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 })
  }

  if (!message.trim()) {
    return NextResponse.json({ detail: "Message is required" }, { status: 422 })
  }

  // Simulate realistic latency
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 900))

  const reply = buildReply(message)
  return NextResponse.json({ reply })
}

function buildReply(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes("code") || lower.includes("function") || lower.includes("react")) {
    return `Absolutely — here's a clean, reusable approach. Let's break it down.

### Overview
I'll keep it focused and production-ready.

\`\`\`tsx
import { useState, useCallback } from "react"

export function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = useCallback(() => setOn((v) => !v), [])
  return [on, toggle] as const
}
\`\`\`

**Why this works**

- The state is encapsulated in a single hook.
- \`useCallback\` keeps the \`toggle\` identity stable across renders.
- It returns a tuple so usage stays terse: \`const [open, toggle] = useToggle()\`.

Want me to adapt this to your exact use case?`
  }

  if (lower.includes("stress") || lower.includes("anxious") || lower.includes("overwhelm")) {
    return `I hear you — feeling that way is completely valid, and it takes real awareness to name it.

Let's try a small reset together:

1. **Breathe** — inhale for 4 counts, hold for 4, exhale for 6.
2. **Narrow the scope** — pick the single most important thing for the next hour.
3. **Be kind to yourself** — progress, not perfection.

> "You don't have to see the whole staircase, just take the first step."

What feels like the heaviest thing on your mind right now? We can work through it one piece at a time.`
  }

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return `Hey there — great to see you. I'm here to think things through with you, whether that's untangling a problem, planning something, or just talking it out.

What's on your mind today?`
  }

  return `Great question. Here's how I'd think about **"${message.trim()}"**:

- First, clarify the outcome you actually want.
- Then identify the smallest next step that moves you toward it.
- Finally, remove one point of friction so that step is easy to take.

The goal is momentum, not a perfect plan. If you share a bit more context, I can give you something far more specific and actionable.

*Note: this is a local preview response. Connect your FastAPI backend via \`NEXT_PUBLIC_API_URL\` for live AI answers.*`
}
