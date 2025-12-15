import * as React from "react";

import { cn } from "@/lib/cn";

export type ToggleProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function Toggle({
  className,
  checked,
  onCheckedChange,
  disabled,
  ...props
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 items-center rounded-full border border-border",
        "bg-muted/35 backdrop-blur-md",
        "transition-[background-color,box-shadow,border-color] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked && "bg-[color:color-mix(in_oklch,var(--accent-cyan)_35%,black)]",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-1 h-5 w-5 rounded-full",
          "bg-foreground shadow-sm",
          "transition-[transform,background-color] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
          checked && "translate-x-5 bg-white",
        )}
      />
    </button>
  );
}
