"use client"

import { memo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { CodeBlock } from "./code-block"

function MarkdownImpl({ content }: { content: string }) {
  return (
    <div className="prose-chat">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")
            const isInline = !className && !String(children).includes("\n")

            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }

            return (
              <CodeBlock
                language={match?.[1] ?? ""}
                value={String(children).replace(/\n$/, "")}
              />
            )
          },
          a({ children, ...props }) {
            return (
              <a target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export const Markdown = memo(MarkdownImpl)
