"use client";

import * as React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "@/components/chat/code-block";
import { cn } from "@/lib/utils";

type PreChild = React.ReactElement<{
  className?: string;
  children?: React.ReactNode;
}>;

const components: Components = {
  // `pre` owns block code so `code` only ever handles the inline case.
  pre({ children }) {
    const child = React.Children.toArray(children)[0] as PreChild | undefined;
    const className = child?.props?.className ?? "";
    const match = /language-([\w+-]+)/.exec(className);
    const raw = String(child?.props?.children ?? "").replace(/\n$/, "");
    return <CodeBlock code={raw} language={match?.[1] ?? "text"} />;
  },
  a({ children, ...props }) {
    return (
      <a {...props} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="my-4 overflow-x-auto rounded-lg border border-white/[0.07] p-3">
        <table>{children}</table>
      </div>
    );
  },
};

export const Markdown = React.memo(function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn("md", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
});
