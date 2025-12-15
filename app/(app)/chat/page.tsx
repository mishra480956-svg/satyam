import { auth } from "@/auth";
import {
  createConversationForUser,
  listConversationsForUser,
} from "@/lib/server/conversations";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ChatIndexPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/api/auth/signin");
  }

  const conversations = await listConversationsForUser(userId);

  if (conversations.length > 0) {
    redirect(`/chat/${conversations[0].id}`);
  }

  const conversation = await createConversationForUser(userId);
  redirect(`/chat/${conversation.id}`);
}
