import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

const publishedLessons = {
  where: { published: true },
  orderBy: { sortOrder: "asc" as const },
  select: {
    id: true,
    slug: true,
    title: true,
    description: true,
    thumbnailUrl: true,
    sortOrder: true,
  },
};

/** Catálogo publicado com todos os escalares (inclui `freeAccess`). */
export async function queryPublishedModules() {
  return prisma.module.findMany({
    where: { published: true, parentId: null },
    include: {
      lessons: publishedLessons,
      children: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: publishedLessons,
          children: {
            where: { published: true },
            orderBy: { sortOrder: "asc" },
            include: { lessons: publishedLessons },
          },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

const listPublishedModulesCached = unstable_cache(
  queryPublishedModules,
  ["published-modules", "free-access-v1"],
  { revalidate: 120, tags: ["aulas"] },
);

export async function listPublishedModules() {
  if (process.env.NODE_ENV !== "production") {
    return queryPublishedModules();
  }
  return listPublishedModulesCached();
}
