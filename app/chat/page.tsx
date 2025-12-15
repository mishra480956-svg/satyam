import { auth } from "@/auth";
import { ChatApp } from "@/components/chat/chat-app";

export default async function ChatPage() {
  const session = await auth();

  return <ChatApp userName={session?.user?.name ?? "You"} />;
}
