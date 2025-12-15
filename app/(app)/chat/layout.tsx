import { auth } from "@/auth";
import { providerManager } from "@/lib/ai/providers";
import type { ReactNode } from "react";
import {
  getUserPreferences,
  listConversationsForUser,
} from "@/lib/server/conversations";
import { listQuickPromptsForUser } from "@/lib/server/quickPrompts";
import { redirect } from "next/navigation";
import ChatShell from "./_components/ChatShell";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/api/auth/signin");
  }

  const [conversations, preferences, quickPrompts] = await Promise.all([
    listConversationsForUser(userId),
    getUserPreferences(userId),
    listQuickPromptsForUser(userId),
  ]);

  const availableModels = providerManager.listAvailableModels().map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.provider,
    description: m.description,
  }));

  const serializedConversations = conversations.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  const serializedPreferences = {
    defaultModel: preferences.defaultModel,
    temperature: preferences.temperature,
    uiDensity: preferences.uiDensity as "comfortable" | "compact",
  };

  return (
    <ChatShell
      initialConversations={serializedConversations}
      initialPreferences={serializedPreferences}
      initialQuickPrompts={quickPrompts}
      availableModels={availableModels}
      user={session.user}
    >
      {children}
    </ChatShell>
  );
}
