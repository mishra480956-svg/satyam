import { auth } from "@/auth";

export default async function ChatPage() {
  const session = await auth();

  return (
    <main style={{ padding: 24 }}>
      <h1>Chat</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(
          {
            user: session?.user,
          },
          null,
          2,
        )}
      </pre>
    </main>
  );
}
