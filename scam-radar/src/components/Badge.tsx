"use client";

import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = "default", size = "md", dot = false, className = "", ...props }, ref) => {
    const variants = {
      default: "bg-foreground/10 text-foreground/80 border-border/30",
      success: "bg-accent/10 text-accent border-accent/20",
      warning: "bg-warning/10 text-warning border-warning/20",
      danger: "bg-danger/10 text-danger border-danger/20",
      info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      outline: "bg-transparent text-foreground/70 border-border/50",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs gap-1",
      md: "px-2.5 py-1 text-sm gap-1.5",
      lg: "px-3 py-1.5 text-base gap-2",
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-medium rounded-full border
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        {...props}
      >
        {dot && (
          <span
            className={`
              w-1.5 h-1.5 rounded-full
              ${variant === "success" ? "bg-accent" : ""}
              ${variant === "warning" ? "bg-warning" : ""}
              ${variant === "danger" ? "bg-danger" : ""}
              ${variant === "info" ? "bg-blue-500" : ""}
              ${variant === "default" ? "bg-foreground/40" : ""}
              ${variant === "outline" ? "bg-foreground/30" : ""}
            `}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";