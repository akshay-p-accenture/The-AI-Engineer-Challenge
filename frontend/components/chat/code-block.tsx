"use client";

import * as React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Check, Copy } from "lucide-react";

import { useCopy } from "@/hooks/use-copy";
import { cn } from "@/lib/utils";

/** Theme derived from the Meridian tokens so code sits inside the palette. */
const meridianCodeTheme: Record<string, React.CSSProperties> = {
  'code[class*="language-"]': {
    color: "#DDE1EC",
    background: "none",
    fontFamily: "var(--font-mono), ui-monospace, monospace",
    fontSize: "13px",
    lineHeight: "1.7",
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    tabSize: 2,
    hyphens: "none",
  },
  'pre[class*="language-"]': {
    color: "#DDE1EC",
    background: "none",
    fontFamily: "var(--font-mono), ui-monospace, monospace",
    fontSize: "13px",
    lineHeight: "1.7",
    margin: 0,
    padding: "16px 18px",
    overflow: "auto",
  },
  comment: { color: "#5A6178", fontStyle: "italic" },
  prolog: { color: "#5A6178" },
  doctype: { color: "#5A6178" },
  cdata: { color: "#5A6178" },
  punctuation: { color: "#8B92A8" },
  property: { color: "#9AA6FF" },
  tag: { color: "#9AA6FF" },
  constant: { color: "#9AA6FF" },
  symbol: { color: "#9AA6FF" },
  deleted: { color: "#F08A96" },
  boolean: { color: "#8DE3C4" },
  number: { color: "#8DE3C4" },
  selector: { color: "#E8C39E" },
  "attr-name": { color: "#E8C39E" },
  string: { color: "#E8C39E" },
  char: { color: "#E8C39E" },
  builtin: { color: "#E8C39E" },
  inserted: { color: "#8DE3C4" },
  operator: { color: "#B9C0D4" },
  entity: { color: "#B9C0D4", cursor: "help" },
  url: { color: "#B9C0D4" },
  variable: { color: "#DDE1EC" },
  atrule: { color: "#9AA6FF" },
  "attr-value": { color: "#E8C39E" },
  function: { color: "#BFC6FF" },
  "class-name": { color: "#BFC6FF" },
  keyword: { color: "#9AA6FF", fontStyle: "italic" },
  regex: { color: "#8DE3C4" },
  important: { color: "#F08A96", fontWeight: "bold" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
};

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const { copied, copy } = useCopy();
  const label = language === "text" ? "plain" : language;

  return (
    <div
      className={cn(
        "group/code my-4 overflow-hidden rounded-lg border border-white/[0.07] bg-[hsl(228_26%_5%)] shadow-lift",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
        <span className="eyebrow">{label}</span>
        <button
          type="button"
          onClick={() => void copy(code)}
          className="flex items-center gap-1.5 rounded-sm px-1.5 py-1 font-mono text-2xs uppercase tracking-label text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          aria-label={copied ? "Code copied" : "Copy code"}
        >
          {copied ? (
            <Check className="size-3 text-signal" />
          ) : (
            <Copy className="size-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={meridianCodeTheme}
        customStyle={{ background: "transparent" }}
        wrapLongLines={false}
        PreTag="pre"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
