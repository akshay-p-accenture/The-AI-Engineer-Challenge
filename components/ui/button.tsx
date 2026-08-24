"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

type Variant = "default" | "ghost" | "outline" | "subtle" | "accent"
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm"

const variants: Record<Variant, string> = {
  default:
    "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20",
  accent:
    "bg-accent text-accent-foreground hover:opacity-90 shadow-lg shadow-accent/20",
  ghost: "text-foreground/80 hover:text-foreground hover:bg-surface",
  outline:
    "border border-border-strong text-foreground/90 hover:bg-surface hover:border-border-strong",
  subtle: "bg-surface text-foreground/90 hover:bg-surface-elevated",
}

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-sm gap-2 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
  "icon-sm": "h-8 w-8 rounded-lg",
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
          "disabled:pointer-events-none disabled:opacity-50 select-none",
          "active:scale-[0.97]",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"
