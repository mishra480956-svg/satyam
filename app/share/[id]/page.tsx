import { getConversationSnapshotForShare } from "@/lib/server/conversations";
import { notFound } from "next/navigation";

export const runtime = "nodejs";

function roleLabel(role: string) {
  if (role === "USER") return "User";
  if (role === "ASSISTANT") return "Assistant";
  if (role === "SYSTEM") return "System";
  return role;
}

export default async function SharedConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const conversation = await getConversationSnapshotForShare(id);
  if (!conversation) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {conversation.title}
        </h1>
        <p className="text-sm text-zinc-500">
          Read-only shared transcript
        </p>
      </header>

      <section className="flex flex-col gap-4">
        {conversation.messages.map((m) => (
          <article
            key={m.id}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-black"
          >
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              {roleLabel(m.role)}
            </div>
            <pre className="whitespace-pre-wrap font-sans leading-6">
              {m.content}
            </pre>
          </article>
        ))}
      </section>
    </main>
  );
}
