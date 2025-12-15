import * as React from "react";

import { cn } from "@/lib/cn";

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md";
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = "md", type = "button", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-md",
          "border border-border bg-surface/60 text-foreground backdrop-blur-md",
          "transition-[transform,background-color,box-shadow] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
          "hover:bg-surface/85 hover:shadow-sm active:translate-y-px",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          size === "sm" && "h-9 w-9",
          size === "md" && "h-10 w-10",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
IconButton.displayName = "IconButton";
