import * as React from "react";

import { cn } from "@/lib/cn";

export type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  inset?: boolean;
};

export function Panel({
  className,
  inset = false,
  children,
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface/55 text-surface-foreground shadow-md",
        "backdrop-blur-xl",
        inset && "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
