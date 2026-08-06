import { prisma } from "@/lib/db";

export type StudentProgressRow = {
  userId: string;
  displayName: string;
  email: string;
  role: string;
  joinedAt: Date;
  completedCount: number;
  totalLessons: number;
  percent: number;
  completedLessonIds: string[];
  lastCompletedAt: Date | null;
};

export async function getPublishedLessonsCatalog() {
  return prisma.lesson.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      sortOrder: true,
      module: { select: { title: true, sortOrder: true } },
    },
    orderBy: [
      { module: { sortOrder: "asc" } },
      { sortOrder: "asc" },
    ],
  });
}

/** Progresso de aulas publicadas por membro active. */
export async function listStudentsLessonProgress(): Promise<{
  lessons: Awaited<ReturnType<typeof getPublishedLessonsCatalog>>;
  students: StudentProgressRow[];
  summary: {
    activeMembers: number;
    totalLessons: number;
    averagePercent: number;
    completedAll: number;
    notStarted: number;
  };
}> {
  const lessons = await getPublishedLessonsCatalog();
  const totalLessons = lessons.length;
  const lessonIdSet = new Set(lessons.map((l) => l.id));

  const memberships = await prisma.membership.findMany({
    where: { status: "active" },
    include: {
      user: {
        include: {
          profile: true,
          lessonProgress: {
            where: { completedAt: { not: null } },
            select: { lessonId: true, completedAt: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const students: StudentProgressRow[] = memberships.map((m) => {
    const completed = m.user.lessonProgress.filter((p) =>
      lessonIdSet.has(p.lessonId),
    );
    const completedCount = completed.length;
    const percent =
      totalLessons === 0
        ? 0
        : Math.round((completedCount / totalLessons) * 100);
    const lastCompletedAt =
      completed.length === 0
        ? null
        : completed.reduce<Date | null>((acc, row) => {
            if (!row.completedAt) return acc;
            if (!acc || row.completedAt > acc) return row.completedAt;
            return acc;
          }, null);

    return {
      userId: m.userId,
      displayName: m.user.profile?.displayName ?? m.user.email,
      email: m.user.email,
      role: m.role,
      joinedAt: m.user.profile?.joinedAt ?? m.createdAt,
      completedCount,
      totalLessons,
      percent,
      completedLessonIds: completed.map((c) => c.lessonId),
      lastCompletedAt,
    };
  });

  students.sort((a, b) => {
    if (a.percent !== b.percent) return a.percent - b.percent;
    return a.displayName.localeCompare(b.displayName, "pt-BR");
  });

  const averagePercent =
    students.length === 0
      ? 0
      : Math.round(
          students.reduce((sum, s) => sum + s.percent, 0) / students.length,
        );

  return {
    lessons,
    students,
    summary: {
      activeMembers: students.length,
      totalLessons,
      averagePercent,
      completedAll: students.filter(
        (s) => totalLessons > 0 && s.completedCount === totalLessons,
      ).length,
      notStarted: students.filter((s) => s.completedCount === 0).length,
    },
  };
}
