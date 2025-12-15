import * as React from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-tight",
    "transition-[transform,background-color,box-shadow,color,border-color]",
    "duration-[var(--motion-fast)] ease-[var(--ease-out)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    size === "sm" && "h-9 px-3 text-sm",
    size === "md" && "h-10 px-4 text-sm",
    size === "lg" && "h-11 px-5 text-base",
    variant === "primary" &&
      cn(
        "bg-[image:var(--gradient-accent)] text-black",
        "shadow-sm hover:shadow-md",
        "active:translate-y-px",
      ),
    variant === "secondary" &&
      cn(
        "border border-border bg-surface/70 text-foreground backdrop-blur-md",
        "hover:bg-surface/90",
        "active:translate-y-px",
      ),
    variant === "ghost" &&
      cn(
        "bg-transparent text-foreground",
        "hover:bg-muted/40",
        "active:bg-muted/55",
      ),
    variant === "danger" &&
      cn(
        "border border-border bg-[color:var(--danger)] text-white",
        "hover:bg-[color:color-mix(in_oklch,var(--danger)_90%,black)]",
        "active:translate-y-px",
      ),
    className,
  );
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", type = "button", children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClassName({ variant, size, className })}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
