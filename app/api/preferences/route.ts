import { auth } from "@/auth";
import { getUserPreferences, updateUserPreferences } from "@/lib/server/conversations";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await getUserPreferences(userId);
  return NextResponse.json({ preferences });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    defaultModel?: string;
    temperature?: number;
    uiDensity?: "comfortable" | "compact";
  };

  const preferences = await updateUserPreferences(userId, {
    defaultModel: body.defaultModel,
    temperature: body.temperature,
    uiDensity: body.uiDensity,
  });

  return NextResponse.json({ preferences });
}
