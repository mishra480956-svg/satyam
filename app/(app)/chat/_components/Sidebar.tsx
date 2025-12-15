"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useChatApp } from "./ChatProvider";
import { useToast } from "./ToastProvider";

function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toMarkdown(conversation: {
  title: string;
  messages: Array<{ role: string; content: string }>;
}) {
  const lines: string[] = [];
  lines.push(`# ${conversation.title}`);
  lines.push("");

  for (const m of conversation.messages) {
    const role =
      m.role === "USER"
        ? "User"
        : m.role === "ASSISTANT"
          ? "Assistant"
          : m.role;

    lines.push(`## ${role}`);
    lines.push("");
    lines.push(m.content);
    lines.push("");
  }

  return lines.join("\n");
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightSnippet({ text, query }: { text: string; query: string }) {
  const { parts, matchTerms } = useMemo(() => {
    const terms = query
      .trim()
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 5);

    if (terms.length === 0) {
      return { parts: [text], matchTerms: new Set<string>() };
    }

    const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "ig");
    return {
      parts: text.split(pattern),
      matchTerms: new Set(terms.map((t) => t.toLowerCase())),
    };
  }, [text, query]);

  if (matchTerms.size === 0) return <>{text}</>;

  return (
    <>
      {parts.map((p, idx) =>
        matchTerms.has(p.toLowerCase()) ? (
          <mark
            key={idx}
            className="rounded bg-amber-200 px-0.5 text-zinc-900 dark:bg-amber-300"
          >
            {p}
          </mark>
        ) : (
          <span key={idx}>{p}</span>
        ),
      )}
    </>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { pushToast } = useToast();

  const {
    conversations,
    setConversations,
    activeConversation,
    updateActiveConversation,
    searchQuery,
    setSearchQuery,
    searchResults,
  } = useChatApp();

  const activeIdFromUrl = useMemo(() => {
    const match = pathname.match(/^\/chat\/([^/]+)$/);
    return match?.[1];
  }, [pathname]);

  const activeId = activeConversation?.id ?? activeIdFromUrl;

  const [creating, setCreating] = useState(false);

  const createNewChat = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        pushToast("error", "Failed to create conversation");
        return;
      }

      const data = (await res.json().catch(() => null)) as
        | {
            conversation?: {
              id: string;
              title: string;
              createdAt: string;
              updatedAt: string;
            };
          }
        | null;

      if (data?.conversation) {
        setConversations((prev) => [data.conversation!, ...prev]);
        router.push(`/chat/${data.conversation.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  const renameConversation = async (id: string) => {
    const current = conversations.find((c) => c.id === id)?.title;
    const title = window.prompt("Rename conversation", current);
    if (!title?.trim()) return;

    const res = await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      pushToast("error", "Failed to rename conversation");
      return;
    }

    const data = (await res.json().catch(() => null)) as
      | {
          conversation?: {
            id: string;
            title: string;
            createdAt: string;
            updatedAt: string;
          };
        }
      | null;

    if (data?.conversation) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, title: data.conversation!.title } : c,
        ),
      );

      if (activeConversation?.id === id) {
        updateActiveConversation((c) => ({ ...c, title: data.conversation!.title }));
      }
    }
  };

  const deleteConversation = async (id: string) => {
    const ok = window.confirm("Delete this conversation? This can’t be undone.");
    if (!ok) return;

    const remaining = conversations.filter((c) => c.id !== id);

    const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast("error", "Failed to delete conversation");
      return;
    }

    setConversations(remaining);

    if (activeId === id) {
      if (remaining[0]) {
        router.push(`/chat/${remaining[0].id}`);
      } else {
        router.push("/chat");
      }
    }
  };

  const exportMarkdown = () => {
    if (!activeConversation) return;
    downloadText(
      `${activeConversation.title.replaceAll("/", "-")}.md`,
      toMarkdown(activeConversation),
      "text/markdown;charset=utf-8",
    );
  };

  const exportJson = () => {
    if (!activeConversation) return;
    downloadText(
      `${activeConversation.title.replaceAll("/", "-")}.json`,
      JSON.stringify(activeConversation, null, 2),
      "application/json;charset=utf-8",
    );
  };

  const shareConversation = async () => {
    if (!activeConversation) return;

    const res = await fetch(`/api/conversations/${activeConversation.id}/share`);
    if (!res.ok) {
      pushToast("error", "Failed to generate share link");
      return;
    }

    const data = (await res.json().catch(() => null)) as { shareUrl?: string } | null;

    if (!data?.shareUrl) {
      pushToast("error", "Failed to generate share link");
      return;
    }

    const absolute = `${window.location.origin}${data.shareUrl}`;
    await navigator.clipboard.writeText(absolute);
    pushToast("success", "Share link copied");
  };

  return (
    <aside className="flex h-full w-80 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="text-sm font-semibold tracking-tight">SATYNX</div>
        <button
          type="button"
          onClick={createNewChat}
          disabled={creating}
          className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          New
        </button>
      </div>

      <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search this chat…"
          className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-black dark:focus:ring-zinc-800"
        />

        {searchQuery.trim() ? (
          <div className="max-h-40 overflow-auto rounded-md border border-zinc-200 dark:border-zinc-800">
            {searchResults.length === 0 ? (
              <div className="px-3 py-2 text-xs text-zinc-500">No matches</div>
            ) : (
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {searchResults.map((r) => (
                  <li key={r.messageId}>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(`message-${r.messageId}`);
                        el?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      <div className="mb-1 font-medium text-zinc-600 dark:text-zinc-300">
                        {r.role}
                      </div>
                      <div className="text-zinc-600 dark:text-zinc-300">
                        <HighlightSnippet text={r.snippet} query={searchQuery} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex-1 overflow-auto px-2 py-2">
        <div className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Chats
        </div>
        <ul className="flex flex-col gap-1">
          {conversations.map((c) => {
            const isActive = c.id === activeId;
            return (
              <li key={c.id}>
                <div
                  className={
                    "group flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm " +
                    (isActive
                      ? "bg-zinc-100 dark:bg-zinc-900"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-900")
                  }
                >
                  <button
                    type="button"
                    onClick={() => router.push(`/chat/${c.id}`)}
                    className="min-w-0 flex-1 truncate text-left"
                  >
                    {c.title}
                  </button>
                  <div className="hidden items-center gap-1 group-hover:flex">
                    <button
                      type="button"
                      onClick={() => renameConversation(c.id)}
                      className="rounded border border-zinc-200 px-2 py-1 text-[11px] hover:bg-white dark:border-zinc-800 dark:hover:bg-black"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteConversation(c.id)}
                      className="rounded border border-zinc-200 px-2 py-1 text-[11px] hover:bg-white dark:border-zinc-800 dark:hover:bg-black"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!activeConversation}
            onClick={exportMarkdown}
            className="rounded-md border border-zinc-200 px-2.5 py-2 text-xs font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Export MD
          </button>
          <button
            type="button"
            disabled={!activeConversation}
            onClick={exportJson}
            className="rounded-md border border-zinc-200 px-2.5 py-2 text-xs font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Export JSON
          </button>
          <button
            type="button"
            disabled={!activeConversation}
            onClick={shareConversation}
            className="col-span-2 rounded-md border border-zinc-200 px-2.5 py-2 text-xs font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Share
          </button>
        </div>
      </div>
    </aside>
  );
}
