"use client";

import type { ReactNode } from "react";
import { ChatProvider } from "./ChatProvider";
import type {
  ConversationSummary,
  ModelOption,
  QuickPrompt,
  UserPreferences,
} from "./types";
import { ToastProvider } from "./ToastProvider";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function ChatShell({
  children,
  initialConversations,
  initialPreferences,
  initialQuickPrompts,
  availableModels,
  user,
}: {
  children: ReactNode;
  initialConversations: ConversationSummary[];
  initialPreferences: UserPreferences;
  initialQuickPrompts: QuickPrompt[];
  availableModels: ModelOption[];
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  return (
    <ToastProvider>
      <ChatProvider
        initialConversations={initialConversations}
        initialPreferences={initialPreferences}
        initialQuickPrompts={initialQuickPrompts}
        availableModels={availableModels}
        user={user}
      >
        <div className="flex h-dvh w-full bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
          </div>
        </div>
      </ChatProvider>
    </ToastProvider>
  );
}
