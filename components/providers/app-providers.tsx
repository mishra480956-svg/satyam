"use client";

import * as React from "react";
import { MotionConfig } from "framer-motion";

import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>{children}</ThemeProvider>
    </MotionConfig>
  );
}
