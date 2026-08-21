import { prisma } from "@/lib/db";
import { listPublishedModules } from "@/lib/aulas";
import { WELCOME_SPACE_SLUG } from "@/lib/spaces/constants";

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
  postsCount: number;
  commentsCount: number;
  reactionsCount: number;
  lastPostAt: Date | null;
};

type PublishedNode = {
  title: string;
  sortOrder: number;
  lessons: Array<{ id: string; title: string; sortOrder: number }>;
  children?: PublishedNode[];
};

/** Mesma árvore do catálogo do aluno, na ordem da jornada. */
export async function getPublishedLessonsCatalog() {
  const roots = await listPublishedModules();
  const lessons: Array<{
    id: string;
    title: string;
    sortOrder: number;
    module: { title: string; sortOrder: number };
  }> = [];

  function walk(mod: PublishedNode, path: string[]) {
    const titles = [...path, mod.title];
    const moduleTitle = titles.join(" › ");
    for (const lesson of mod.lessons) {
      lessons.push({
        id: lesson.id,
        title: lesson.title,
        sortOrder: lesson.sortOrder,
        module: { title: moduleTitle, sortOrder: mod.sortOrder },
      });
    }
    for (const child of mod.children ?? []) {
      walk(child, titles);
    }
  }

  for (const root of roots) {
    walk(root, []);
  }
  return lessons;
}

/** Progresso de aulas + atividade de posts por membro active. */
export async function listStudentsLessonProgress(): Promise<{
  lessons: Awaited<ReturnType<typeof getPublishedLessonsCatalog>>;
  students: StudentProgressRow[];
  summary: {
    activeMembers: number;
    totalLessons: number;
    averagePercent: number;
    completedAll: number;
    notStarted: number;
    totalPosts: number;
    membersWithPosts: number;
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
          _count: {
            select: {
              posts: true,
              comments: true,
              reactions: true,
            },
          },
          posts: {
            where: {
              space: { slug: { not: WELCOME_SPACE_SLUG } },
            },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { createdAt: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Contagem de posts excluindo boas-vindas (cards de orientação).
  const postCounts = await prisma.post.groupBy({
    by: ["authorId"],
    where: { space: { slug: { not: WELCOME_SPACE_SLUG } } },
    _count: { _all: true },
  });
  const postsByUser = new Map(
    postCounts.map((row) => [row.authorId, row._count._all]),
  );

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
      postsCount: postsByUser.get(m.userId) ?? 0,
      commentsCount: m.user._count.comments,
      reactionsCount: m.user._count.reactions,
      lastPostAt: m.user.posts[0]?.createdAt ?? null,
    };
  });

  students.sort((a, b) => {
    if (a.percent !== b.percent) return a.percent - b.percent;
    if (a.postsCount !== b.postsCount) return a.postsCount - b.postsCount;
    return a.displayName.localeCompare(b.displayName, "pt-BR");
  });

  const averagePercent =
    students.length === 0
      ? 0
      : Math.round(
          students.reduce((sum, s) => sum + s.percent, 0) / students.length,
        );

  const totalPosts = students.reduce((sum, s) => sum + s.postsCount, 0);

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
      totalPosts,
      membersWithPosts: students.filter((s) => s.postsCount > 0).length,
    },
  };
}
