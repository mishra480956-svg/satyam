import { getConversationSnapshotForShare } from "@/lib/server/conversations";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const conversation = await getConversationSnapshotForShare(id);
  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    shareUrl: `/share/${conversation.id}`,
    conversation,
  });
}
