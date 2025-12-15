"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useChatApp } from "./ChatProvider";
import SettingsDrawer from "./SettingsDrawer";

export default function Header() {
  const { activeConversation, user } = useChatApp();
  const [open, setOpen] = useState(false);

  const title = useMemo(() => {
    if (activeConversation) return activeConversation.title;
    return "Chat";
  }, [activeConversation]);

  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-black">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="truncate text-xs text-zinc-500">
          {user.email ?? user.name ?? ""}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/api/auth/signout"
          prefetch={false}
          className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Sign out
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Settings
        </button>
      </div>

      <SettingsDrawer open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
