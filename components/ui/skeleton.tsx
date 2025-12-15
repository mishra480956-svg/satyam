import * as React from "react";

import { cn } from "@/lib/cn";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/35",
        "before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.10),transparent)]",
        "before:animate-[shimmer_1.4s_infinite]",
        className,
      )}
      {...props}
    />
  );
}
