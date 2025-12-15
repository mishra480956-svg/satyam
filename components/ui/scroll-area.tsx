import * as React from "react";

import { cn } from "@/lib/cn";

export type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
  viewportClassName?: string;
  viewportRef?: React.Ref<HTMLDivElement>;
};

export function ScrollArea({
  className,
  viewportClassName,
  viewportRef,
  children,
  ...props
}: ScrollAreaProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      <div
        ref={viewportRef}
        className={cn(
          "satynx-scroll h-full w-full overflow-auto overscroll-contain",
          viewportClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
