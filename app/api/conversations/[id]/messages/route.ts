import { auth } from "@/auth";
import { addMessageToConversationForUser } from "@/lib/server/conversations";
import { type MessageRole } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    role?: MessageRole;
    content?: string;
  };

  if (!body.role || !body.content?.trim()) {
    return NextResponse.json(
      { error: "role and content are required" },
      { status: 400 },
    );
  }

  const message = await addMessageToConversationForUser(userId, id, {
    role: body.role,
    content: body.content,
  });

  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ message }, { status: 201 });
}
