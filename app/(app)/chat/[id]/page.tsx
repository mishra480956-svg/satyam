import { auth } from "@/auth";
import { getConversationForUser } from "@/lib/server/conversations";
import { redirect } from "next/navigation";
import ConversationClient from "../_components/ConversationClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ChatConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/api/auth/signin");
  }

  const { id } = await params;

  const conversation = await getConversationForUser(userId, id);
  if (!conversation) {
    redirect("/chat");
  }

  const serialized = {
    ...conversation,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messages: conversation.messages.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    })),
  };

  return <ConversationClient initialConversation={serialized} />;
}
