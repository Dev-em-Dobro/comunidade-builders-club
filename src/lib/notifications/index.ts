import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function createNotification(opts: {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
}) {
  return prisma.notification.create({
    data: {
      recipientId: opts.recipientId,
      actorId: opts.actorId,
      type: opts.type,
      postId: opts.postId,
      commentId: opts.commentId,
    },
  });
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
