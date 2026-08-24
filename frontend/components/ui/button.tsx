"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lift hover:bg-primary/90 hover:shadow-glow",
        secondary:
          "border border-white/[0.07] bg-white/[0.05] text-foreground shadow-sheen hover:bg-white/[0.09]",
        ghost:
          "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
        outline:
          "border border-white/[0.09] bg-transparent text-foreground hover:bg-white/[0.05]",
        destructive:
          "bg-destructive/90 text-destructive-foreground hover:bg-destructive",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-sm px-3 text-[13px]",
        xs: "h-7 rounded-sm px-2 text-2xs [&_svg]:size-3.5",
        lg: "h-11 rounded-lg px-6",
        icon: "size-9",
        "icon-sm": "size-8 rounded-sm [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
