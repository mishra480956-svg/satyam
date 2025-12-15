import { auth } from "@/auth";
import { listQuickPromptsForUser } from "@/lib/server/quickPrompts";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quickPrompts = await listQuickPromptsForUser(userId);
  return NextResponse.json({ quickPrompts });
}
