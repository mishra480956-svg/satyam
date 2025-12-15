"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/cn";

export type SidebarProps = React.ComponentPropsWithoutRef<"aside"> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "left" | "right";
  widthClassName?: string;
};

export function Sidebar({
  className,
  open,
  onOpenChange,
  side = "left",
  widthClassName = "w-[280px]",
  children,
  ...props
}: SidebarProps) {
  const isOverlay = typeof open === "boolean" && typeof onOpenChange === "function";

  if (!isOverlay) {
    return (
      <aside
        className={cn(
          "rounded-2xl border border-border bg-surface/55 text-surface-foreground shadow-md backdrop-blur-xl",
          widthClassName,
          className,
        )}
        {...props}
      >
        {children}
      </aside>
    );
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            className={cn(
              "absolute top-0 h-full",
              side === "left" ? "left-0" : "right-0",
              widthClassName,
            )}
            initial={{ x: side === "left" ? -24 : 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: side === "left" ? -24 : 24, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <aside
              className={cn(
                "h-full rounded-r-2xl border border-border bg-surface/70 text-surface-foreground shadow-lg backdrop-blur-xl",
                side === "right" && "rounded-l-2xl rounded-r-none",
                className,
              )}
              {...props}
            >
              {children}
            </aside>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
