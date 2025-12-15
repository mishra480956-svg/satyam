import { prisma } from "@/lib/db";

import { type MessageRole, type Prisma } from "@prisma/client";

export async function listConversationsForUser(userId: string) {
  return prisma.conversation.findMany({
    where: { userId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createConversationForUser(userId: string, title?: string) {
  return prisma.conversation.create({
    data: {
      userId,
      title: title?.trim() || "New conversation",
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getConversationForUser(userId: string, conversationId: string) {
  return prisma.conversation.findFirst({
    where: { id: conversationId, userId, deletedAt: null },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
}

export async function renameConversationForUser(
  userId: string,
  conversationId: string,
  title: string,
) {
  const existing = await prisma.conversation.findFirst({
    where: { id: conversationId, userId, deletedAt: null },
    select: { id: true },
  });

  if (!existing) return null;

  return prisma.conversation.update({
    where: { id: conversationId },
    data: {
      title: title.trim(),
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function softDeleteConversationForUser(userId: string, conversationId: string) {
  const existing = await prisma.conversation.findFirst({
    where: { id: conversationId, userId, deletedAt: null },
    select: { id: true },
  });

  if (!existing) return null;

  return prisma.conversation.update({
    where: { id: conversationId },
    data: {
      deletedAt: new Date(),
    },
    select: {
      id: true,
      deletedAt: true,
    },
  });
}

export async function addMessageToConversationForUser(
  userId: string,
  conversationId: string,
  input: { role: MessageRole; content: string },
) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId, deletedAt: null },
    select: { id: true },
  });

  if (!conversation) {
    return null;
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        userId,
        conversationId,
        role: input.role,
        content: input.content,
      },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
      select: { id: true },
    }),
  ]);

  return message;
}

export async function getUserPreferences(userId: string) {
  return prisma.userPreference.upsert({
    where: { userId },
    create: { userId },
    update: { deletedAt: null },
    select: {
      defaultModel: true,
      temperature: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateUserPreferences(
  userId: string,
  input: Partial<Pick<Prisma.UserPreferenceUncheckedCreateInput, "defaultModel" | "temperature">>,
) {
  return prisma.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      defaultModel: input.defaultModel ?? undefined,
      temperature: input.temperature ?? undefined,
    },
    update: {
      deletedAt: null,
      defaultModel: input.defaultModel ?? undefined,
      temperature: input.temperature ?? undefined,
    },
    select: {
      defaultModel: true,
      temperature: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
