"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useTheme } from "@/components/providers/theme-provider";
import {
  Button,
  Card,
  Dialog,
  IconButton,
  IconMenu,
  IconMoon,
  IconSend,
  IconSettings,
  IconSun,
  Input,
  Panel,
  ScrollArea,
  Sidebar,
  Skeleton,
  TextArea,
  Toggle,
} from "@/components/ui";
import { cn } from "@/lib/cn";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

export function ChatApp({
  userName = "You",
}: {
  userName?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { theme, setTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const [messages, setMessages] = React.useState<ChatMessage[]>(() => [
    {
      id: uid(),
      role: "assistant",
      content:
        "Welcome to SATYNX. This is a design-system backed chat shell with motion + glass UI.",
    },
    {
      id: uid(),
      role: "user",
      content: "Show me the neon + black-first aesthetic.",
    },
    {
      id: uid(),
      role: "assistant",
      content:
        "Done. Messages animate in, the sidebar slides on mobile, and the settings drawer respects prefers-reduced-motion.",
    },
  ]);

  const [composer, setComposer] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [messages, prefersReducedMotion]);

  const send = React.useCallback(() => {
    const content = composer.trim();
    if (!content) return;

    setMessages((prev) => [...prev, { id: uid(), role: "user", content }]);
    setComposer("");

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content:
            "(Demo) Hook up streaming responses to /api/agent and replace this placeholder.",
        },
      ]);
    }, prefersReducedMotion ? 0 : 220);
  }, [composer, prefersReducedMotion]);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Sidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        className="p-4"
      >
        <SidebarContents
          userName={userName}
          onOpenSettings={() => setSettingsOpen(true)}
          onPickThread={() => setSidebarOpen(false)}
        />
      </Sidebar>

      <Sidebar className="hidden p-4 lg:block">
        <SidebarContents
          userName={userName}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </Sidebar>

      <Panel className="flex min-h-[70dvh] flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <IconButton
              aria-label="Open sidebar"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <IconMenu className="h-5 w-5" />
            </IconButton>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium tracking-tight">
                SATYNX Chat
              </div>
              <div className="truncate text-xs text-muted-foreground">
                Futuristic • black-first • motion-aware
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              aria-label="Open settings"
              onClick={() => setSettingsOpen(true)}
            >
              <IconSettings className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        <div className="flex-1 px-3 py-3">
          <ScrollArea
            className="h-full"
            viewportRef={scrollRef}
            viewportClassName="pr-2"
          >
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className={cn(
                      "flex",
                      m.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <Card
                      className={cn(
                        "max-w-[86%] px-4 py-3 text-sm leading-6",
                        m.role === "user" &&
                          "border-[color:color-mix(in_oklch,var(--accent-cyan)_45%,var(--border))] bg-[color:color-mix(in_oklch,var(--accent-cyan)_10%,var(--card))]",
                      )}
                    >
                      <div className="mb-1 text-[11px] text-muted-foreground">
                        {m.role === "user" ? userName : "SATYNX"}
                      </div>
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="grid gap-2 pt-3">
                <div className="text-xs text-muted-foreground">Quick actions</div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="border-t border-border p-3">
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <Input
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              placeholder="Type a message…"
              aria-label="Message"
            />
            <Button type="submit" className="shrink-0">
              <IconSend className="h-4 w-4" />
              Send
            </Button>
          </form>
        </div>
      </Panel>

      <Dialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        title="Settings"
        description="Theme, motion and prompt options"
        variant="drawer"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Theme</div>
              <div className="text-sm text-muted-foreground">
                Toggle between dark and light
              </div>
            </div>

            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <IconMoon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <IconSun className="h-4 w-4 text-muted-foreground" />
              )}
              <Toggle
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">System prompt</div>
            <div className="text-sm text-muted-foreground">
              Optional prompt override for this thread
            </div>
            <TextArea placeholder="You are SATYNX…" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Motion</div>
              <div className="text-sm text-muted-foreground">
                Framer Motion respects system preference
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {prefersReducedMotion ? "Reduced" : "Full"}
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setSettingsOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function SidebarContents({
  userName,
  onOpenSettings,
  onPickThread,
}: {
  userName: string;
  onOpenSettings: () => void;
  onPickThread?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <div className="text-xs text-muted-foreground">Signed in as</div>
        <div className="truncate text-sm font-medium">{userName}</div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Threads</div>
        <div className="grid gap-2">
          {[
            "Onboarding",
            "Model routing",
            "Design system",
            "Quick actions",
          ].map((t) => (
            <button
              key={t}
              type="button"
              onClick={onPickThread}
              className={cn(
                "w-full rounded-md border border-border bg-card/60 px-3 py-2 text-left text-sm",
                "transition-[background-color,transform,box-shadow] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
                "hover:bg-card/80 hover:shadow-sm active:translate-y-px",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <Button variant="secondary" className="w-full" onClick={onOpenSettings}>
          <IconSettings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}
