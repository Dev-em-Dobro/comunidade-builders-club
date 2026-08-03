import { z } from "zod";
import { prisma } from "@/lib/db";

/** Só alfanumérico / hífen / underscore — evita host injection no embed. */
const PANDA_ID_RE = /^[a-zA-Z0-9_-]+$/;

export function pandaEmbedUrl(libraryId: string, externalId: string): string {
  const lib = libraryId
    .replace(/^player-vz-/, "")
    .replace(/\.tv\.pandavideo\.com\.br.*$/, "");
  if (!PANDA_ID_RE.test(lib) || !PANDA_ID_RE.test(externalId)) {
    throw new Error("IDs Panda inválidos");
  }
  return `https://player-vz-${lib}.tv.pandavideo.com.br/embed/?v=${encodeURIComponent(externalId)}`;
}

export const moduleSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(false),
});

export const lessonSchema = z.object({
  moduleId: z.string().min(1),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  pandaVideoExternalId: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(PANDA_ID_RE, "ID externo Panda inválido"),
  pandaLibraryId: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(PANDA_ID_RE, "Library ID Panda inválido"),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(false),
});

export async function listPublishedModules() {
  return prisma.module.findMany({
    where: { published: true },
    include: {
      lessons: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listAllModulesAdmin() {
  return prisma.module.findMany({
    include: {
      lessons: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getLessonForMember(moduleSlug: string, lessonSlug: string) {
  return prisma.lesson.findFirst({
    where: {
      slug: lessonSlug,
      published: true,
      module: { slug: moduleSlug, published: true },
    },
    include: { module: true },
  });
}

export async function createModule(raw: z.infer<typeof moduleSchema>) {
  const data = moduleSchema.parse(raw);
  return prisma.module.create({ data });
}

export async function updateModule(
  id: string,
  raw: z.infer<typeof moduleSchema>,
) {
  const data = moduleSchema.parse(raw);
  return prisma.module.update({ where: { id }, data });
}

export async function deleteModule(id: string) {
  return prisma.module.delete({ where: { id } });
}

export async function createLesson(raw: z.infer<typeof lessonSchema>) {
  const data = lessonSchema.parse(raw);
  return prisma.lesson.create({ data });
}

export async function updateLesson(
  id: string,
  raw: z.infer<typeof lessonSchema>,
) {
  const data = lessonSchema.parse(raw);
  return prisma.lesson.update({ where: { id }, data });
}

export async function deleteLesson(id: string) {
  return prisma.lesson.delete({ where: { id } });
}

export async function getLessonProgress(userId: string, lessonId: string) {
  return prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
}

export async function markLessonCompleted(userId: string, lessonId: string) {
  return prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: {
      userId,
      lessonId,
      completedAt: new Date(),
    },
    update: {
      completedAt: new Date(),
    },
  });
}

export async function listCompletedLessonIds(userId: string) {
  const rows = await prisma.lessonProgress.findMany({
    where: { userId, completedAt: { not: null } },
    select: { lessonId: true },
  });
  return new Set(rows.map((r) => r.lessonId));
}
