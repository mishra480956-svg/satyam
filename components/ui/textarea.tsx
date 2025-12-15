import * as React from "react";

import { cn } from "@/lib/cn";

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-24 w-full resize-y rounded-md border border-border bg-surface/60 p-3 text-sm text-foreground",
          "backdrop-blur-md",
          "placeholder:text-muted-foreground",
          "transition-[border-color,box-shadow,background-color] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
TextArea.displayName = "TextArea";
