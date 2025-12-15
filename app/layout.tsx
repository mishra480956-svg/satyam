import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SATYNX AI Chat",
  description: "SATYNX — black-first AI chat with a futuristic design system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>
          <div className="relative min-h-[100dvh] overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
            >
              <div className="absolute inset-0 bg-[image:var(--gradient-accent-soft)] opacity-80" />
              <div className="absolute -top-64 left-1/2 h-[680px] w-[980px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--accent-cyan)_16%,transparent)_0%,transparent_60%)] blur-3xl" />
              <div className="absolute -bottom-72 right-[-180px] h-[620px] w-[720px] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--accent-magenta)_14%,transparent)_0%,transparent_60%)] blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />
            </div>

            <div className="mx-auto w-full max-w-[var(--app-max-width)] px-[var(--app-gutter)] py-8">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12">{children}</div>
              </div>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
