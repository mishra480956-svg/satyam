import * as React from "react";

import { cn } from "@/lib/cn";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/70 text-card-foreground shadow-sm",
        "backdrop-blur-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
