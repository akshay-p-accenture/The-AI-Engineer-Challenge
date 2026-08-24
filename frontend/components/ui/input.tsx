"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-sm text-foreground shadow-sheen transition-colors",
        "placeholder:text-muted-foreground/70 focus-visible:border-primary/40 focus-visible:bg-white/[0.05] focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
