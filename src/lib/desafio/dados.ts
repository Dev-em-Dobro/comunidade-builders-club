import { cache } from "react";
import { prisma as db } from "@/lib/db";

export const getRequiredLessons = cache(() => db.challengeRequiredLesson.findMany({
  orderBy: { phase: "asc" },
  include: { lesson: {
    select: { id: true, title: true, slug: true, module: { select: { slug: true } } },
  } },
}));

export const getContacts = cache((userId: string) => db.warmContact.findMany({
  where: { userId },
  orderBy: { createdAt: "desc" },
  include: { events: { orderBy: [{ at: "asc" }, { id: "asc" }] } },
}));

export const getCheckins = cache((userId: string) => db.challengeCheckin.findMany({
  where: { userId }, orderBy: { week: "desc" },
}));

export const getProgressByUsers = cache((userIds: string[], lessonIds: string[]) =>
  db.lessonProgress.findMany({
    where: { userId: { in: userIds }, lessonId: { in: lessonIds }, completedAt: { not: null } },
    select: { userId: true, lessonId: true, completedAt: true },
  }),
);

export const getEnrollments = cache(() => db.challengeEnrollment.findMany({
  orderBy: { appliedAt: "desc" },
  include: { user: { select: {
    name: true, email: true,
    profile: { select: { displayName: true, avatarUrl: true } },
    membership: { select: { status: true, tier: true, role: true } },
    warmContacts: { orderBy: { createdAt: "desc" }, include: { events: { orderBy: [{ at: "asc" }, { id: "asc" }] } } },
    challengeCheckins: { orderBy: { week: "desc" } },
  } } },
}));
