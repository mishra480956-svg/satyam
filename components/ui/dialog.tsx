"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/cn";
import { IconButton } from "./icon-button";
import { IconX } from "./icons";

export type DialogVariant = "modal" | "drawer";

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: DialogVariant;
  side?: "right" | "left";
  children: React.ReactNode;
  className?: string;
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  footer,
  variant = "modal",
  side = "right",
  children,
  className,
}: DialogProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onOpenChange]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "absolute",
              variant === "modal" &&
                "left-1/2 top-1/2 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2",
              variant === "drawer" &&
                cn(
                  "top-0 h-full w-[min(92vw,420px)]",
                  side === "right" && "right-0",
                  side === "left" && "left-0",
                ),
              "rounded-2xl border border-border bg-surface/70 text-surface-foreground shadow-lg backdrop-blur-xl",
              className,
            )}
            initial={
              variant === "drawer"
                ? { x: side === "right" ? 24 : -24, opacity: 0 }
                : { y: 12, opacity: 0, scale: 0.98 }
            }
            animate={
              variant === "drawer"
                ? { x: 0, opacity: 1 }
                : { y: 0, opacity: 1, scale: 1 }
            }
            exit={
              variant === "drawer"
                ? { x: side === "right" ? 24 : -24, opacity: 0 }
                : { y: 12, opacity: 0, scale: 0.98 }
            }
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div className="min-w-0">
                {title ? (
                  <div className="truncate text-base font-semibold tracking-tight">
                    {title}
                  </div>
                ) : null}
                {description ? (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </div>
                ) : null}
              </div>
              <IconButton
                aria-label="Close"
                size="sm"
                className="shrink-0"
                onClick={() => onOpenChange(false)}
              >
                <IconX className="h-4 w-4" />
              </IconButton>
            </div>

            <div className="px-5 py-4">{children}</div>

            {footer ? (
              <div className="border-t border-border px-5 py-4">{footer}</div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
