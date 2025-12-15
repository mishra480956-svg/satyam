import { prisma } from "@/lib/db";

export async function listQuickPromptsForUser(userId: string) {
  return prisma.quickPrompt.findMany({
    where: {
      deletedAt: null,
      OR: [{ userId: null }, { userId }],
    },
    orderBy: [{ userId: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      key: true,
      title: true,
      prompt: true,
      description: true,
    },
  });
}
