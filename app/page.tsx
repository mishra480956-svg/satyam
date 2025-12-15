import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/chat");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-black">
        <h1 className="text-xl font-semibold tracking-tight">SATYNX Chat</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Sign in to start chatting and manage multiple sessions.
        </p>
        <div className="mt-6 flex gap-2">
          <Link
            href="/api/auth/signin"
            prefetch={false}
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
