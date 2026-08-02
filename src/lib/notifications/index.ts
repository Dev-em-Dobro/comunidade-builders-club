import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { snippetFromBody } from "@/lib/markdown/text";

export async function createNotification(opts: {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
  snippet?: string | null;
}) {
  return prisma.notification.create({
    data: {
      recipientId: opts.recipientId,
      actorId: opts.actorId,
      type: opts.type,
      postId: opts.postId,
      commentId: opts.commentId,
      snippet: opts.snippet
        ? snippetFromBody(opts.snippet, 140)
        : null,
    },
  });
}

export async function notifyMany(
  recipientIds: string[],
  opts: Omit<Parameters<typeof createNotification>[0], "recipientId">,
) {
  const unique = [...new Set(recipientIds)].filter(
    (id) => id !== opts.actorId,
  );
  await Promise.all(
    unique.map((recipientId) => createNotification({ ...opts, recipientId })),
  );
}

export async function listNotifications(userId: string, take = 30) {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    include: {
      actor: { include: { profile: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function listUnreadPreview(userId: string, take = 8) {
  return prisma.notification.findMany({
    where: { recipientId: userId, readAt: null },
    include: {
      actor: { include: { profile: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function countUnread(userId: string) {
  return prisma.notification.count({
    where: { recipientId: userId, readAt: null },
  });
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  comment_on_post: "comentou no seu post",
  reaction_on_post: "reagiu ao seu post",
  reply_on_comment: "respondeu seu comentário",
  mention_in_post: "mencionou você em um post",
  mention_in_comment: "mencionou você em um comentário",
};
