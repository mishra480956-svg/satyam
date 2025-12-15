import { auth } from "@/auth";
import {
  createConversationForUser,
  listConversationsForUser,
} from "@/lib/server/conversations";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await listConversationsForUser(userId);
  return NextResponse.json({ conversations });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { title?: string };
  const conversation = await createConversationForUser(userId, body.title);

  return NextResponse.json({ conversation }, { status: 201 });
}
