"use client"

import { useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  language: string
  value: string
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="group/code my-3 overflow-hidden rounded-xl border border-border bg-[oklch(0.14_0.01_265)]">
      <div className="flex items-center justify-between border-b border-border/70 bg-white/[0.03] px-3.5 py-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {language || "text"}
        </span>
        <button
          onClick={copy}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium",
            "text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
          )}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-accent" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          background: "transparent",
          padding: "1rem 1.1rem",
          fontSize: "0.82rem",
          lineHeight: 1.6,
        }}
        codeTagProps={{
          style: { fontFamily: "var(--font-mono)" },
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}
