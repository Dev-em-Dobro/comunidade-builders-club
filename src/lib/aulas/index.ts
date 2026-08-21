import { unstable_cache } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";

/** Só alfanumérico / hífen / underscore — evita host injection no embed. */
const PANDA_ID_RE = /^[a-zA-Z0-9_-]+$/;

export function pandaEmbedUrl(libraryId: string, externalId: string): string {
  const lib = libraryId
    .replace(/^player-vz-/, "")
    .replace(/^vz-/, "")
    .replace(/\.tv\.pandavideo\.com\.br.*$/, "");
  if (!PANDA_ID_RE.test(lib) || !PANDA_ID_RE.test(externalId)) {
    throw new Error("IDs Panda inválidos");
  }
  return `https://player-vz-${lib}.tv.pandavideo.com.br/embed/?v=${encodeURIComponent(externalId)}`;
}

/** Extrai pullzone (sem prefixo vz-) da URL de thumbnail CDN Panda. */
export function pullzoneFromThumbnail(thumb?: string | null): string | null {
  if (!thumb) return null;
  const m = thumb.match(/\/vz-([a-z0-9-]+)\//i);
  return m?.[1] ?? null;
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
  coverImageUrl: z.string().trim().max(2000).optional().nullable().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(false),
  parentId: z
    .string()
    .trim()
    .min(1)
    .optional()
    .nullable()
    .or(z.literal("")),
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
  description: z.string().trim().max(12000).optional().nullable(),
  pandaVideoExternalId: z
    .string()
    .trim()
    .max(200)
    .optional()
    .nullable()
    .transform((s) => (s && s.length > 0 ? s : null))
    .refine((s) => s === null || PANDA_ID_RE.test(s), "ID externo Panda inválido"),
  pandaLibraryId: z
    .string()
    .trim()
    .max(200)
    .optional()
    .nullable()
    .transform((s) => (s && s.length > 0 ? s : null))
    .refine((s) => s === null || PANDA_ID_RE.test(s), "Library ID Panda inválido"),
  thumbnailUrl: z.string().trim().max(2000).optional().nullable().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(false),
});

const publishedLessonSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  thumbnailUrl: true,
  sortOrder: true,
} as const;

const publishedModuleFields = {
  id: true,
  slug: true,
  title: true,
  description: true,
  coverImageUrl: true,
  sortOrder: true,
  lessons: {
    where: { published: true },
    orderBy: { sortOrder: "asc" as const },
    select: publishedLessonSelect,
  },
};

const listPublishedModulesCached = unstable_cache(
  async () =>
    prisma.module.findMany({
      where: { published: true, parentId: null },
      select: {
        ...publishedModuleFields,
        children: {
          where: { published: true },
          orderBy: { sortOrder: "asc" },
          select: {
            ...publishedModuleFields,
            children: {
              where: { published: true },
              orderBy: { sortOrder: "asc" },
              select: publishedModuleFields,
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ["published-modules"],
  { revalidate: 120, tags: ["aulas"] },
);

export async function listPublishedModules() {
  return listPublishedModulesCached();
}

export async function listAllModulesAdmin() {
  return prisma.module.findMany({
    where: { parentId: null },
    include: {
      lessons: { orderBy: { sortOrder: "asc" } },
      children: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: { orderBy: { sortOrder: "asc" } },
          children: {
            orderBy: { sortOrder: "asc" },
            include: { lessons: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getLessonForMember(moduleSlug: string, lessonSlug: string) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      slug: lessonSlug,
      published: true,
      module: { slug: moduleSlug, published: true },
    },
    include: {
      module: {
        include: { parent: { include: { parent: true } } },
      },
    },
  });
  if (!lesson) return null;
  type Ancestor = { published: boolean; parent?: Ancestor | null } | null;
  let ancestor: Ancestor = lesson.module.parent;
  while (ancestor) {
    if (!ancestor.published) return null;
    ancestor = ancestor.parent ?? null;
  }
  return lesson;
}

function parentIdFrom(data: z.infer<typeof moduleSchema>): string | null {
  return data.parentId && data.parentId.length > 0 ? data.parentId : null;
}

export async function createModule(raw: z.infer<typeof moduleSchema>) {
  const data = moduleSchema.parse(raw);
  return prisma.module.create({
    data: {
      slug: data.slug,
      title: data.title,
      description: data.description || null,
      coverImageUrl: data.coverImageUrl || null,
      sortOrder: data.sortOrder,
      published: data.published,
      parentId: parentIdFrom(data),
    },
  });
}

export async function updateModule(
  id: string,
  raw: z.infer<typeof moduleSchema>,
) {
  const data = moduleSchema.parse(raw);
  return prisma.module.update({
    where: { id },
    data: {
      slug: data.slug,
      title: data.title,
      description: data.description || null,
      coverImageUrl: data.coverImageUrl || null,
      sortOrder: data.sortOrder,
      published: data.published,
      parentId: parentIdFrom(data),
    },
  });
}

export async function deleteModule(id: string) {
  return prisma.module.delete({ where: { id } });
}

export async function createLesson(raw: z.infer<typeof lessonSchema>) {
  const data = lessonSchema.parse(raw);
  return prisma.lesson.create({
    data: {
      moduleId: data.moduleId,
      slug: data.slug,
      title: data.title,
      description: data.description || null,
      pandaVideoExternalId: data.pandaVideoExternalId,
      pandaLibraryId: data.pandaLibraryId
        ? data.pandaLibraryId.replace(/^vz-/, "")
        : null,
      thumbnailUrl: data.thumbnailUrl || null,
      sortOrder: data.sortOrder,
      published: data.published,
    },
  });
}

export async function updateLesson(
  id: string,
  raw: z.infer<typeof lessonSchema>,
) {
  const data = lessonSchema.parse(raw);
  return prisma.lesson.update({
    where: { id },
    data: {
      moduleId: data.moduleId,
      slug: data.slug,
      title: data.title,
      description: data.description || null,
      pandaVideoExternalId: data.pandaVideoExternalId,
      pandaLibraryId: data.pandaLibraryId
        ? data.pandaLibraryId.replace(/^vz-/, "")
        : null,
      thumbnailUrl: data.thumbnailUrl || null,
      sortOrder: data.sortOrder,
      published: data.published,
    },
  });
}

export async function deleteLesson(id: string) {
  return prisma.lesson.delete({ where: { id } });
}

/** F046 — sobe/desce na lista e reindexa sortOrder (0..n). */
export async function moveModule(id: string, direction: "up" | "down") {
  const target = await prisma.module.findUnique({
    where: { id },
    select: { id: true, parentId: true },
  });
  if (!target) throw new Error("Módulo não encontrado.");

  const modules = await prisma.module.findMany({
    where: { parentId: target.parentId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const index = modules.findIndex((m) => m.id === id);
  if (index < 0) throw new Error("Módulo não encontrado.");
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= modules.length) return;

  const ordered = [...modules];
  const [item] = ordered.splice(index, 1);
  ordered.splice(swapWith, 0, item!);

  await prisma.$transaction(
    ordered.map((m, i) =>
      prisma.module.update({ where: { id: m.id }, data: { sortOrder: i } }),
    ),
  );
}

export async function moveLesson(id: string, direction: "up" | "down") {
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    select: { id: true, moduleId: true },
  });
  if (!lesson) throw new Error("Aula não encontrada.");

  const lessons = await prisma.lesson.findMany({
    where: { moduleId: lesson.moduleId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const index = lessons.findIndex((l) => l.id === id);
  if (index < 0) return;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= lessons.length) return;

  const ordered = [...lessons];
  const [item] = ordered.splice(index, 1);
  ordered.splice(swapWith, 0, item!);

  await prisma.$transaction(
    ordered.map((l, i) =>
      prisma.lesson.update({ where: { id: l.id }, data: { sortOrder: i } }),
    ),
  );
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

/** Marcador estável do post de discussão da aula (não é URL pública). */
export function lessonDiscussionMarker(lessonId: string) {
  return `builders-club://aula/${lessonId}`;
}

export function parseLessonDiscussionMarker(
  linkUrl: string | null | undefined,
): string | null {
  if (!linkUrl?.startsWith("builders-club://aula/")) return null;
  const id = linkUrl.slice("builders-club://aula/".length).trim();
  return id || null;
}

/**
 * Garante um Post oculto (space aula-threads) para comentários da aula.
 * Reusa o modelo Comment/notificações existentes.
 */
export async function ensureLessonDiscussionPost(lesson: {
  id: string;
  title: string;
  authorFallbackId: string;
}) {
  const { AULA_THREADS_SPACE_SLUG } = await import("@/lib/spaces/constants");
  const marker = lessonDiscussionMarker(lesson.id);

  const existing = await prisma.post.findFirst({
    where: { linkUrl: marker },
    select: { id: true },
  });
  if (existing) return existing;

  const space = await prisma.space.upsert({
    where: { slug: AULA_THREADS_SPACE_SLUG },
    create: {
      slug: AULA_THREADS_SPACE_SLUG,
      name: "Discussões de aulas",
      description: "Threads internas das aulas (não aparece no menu)",
      sortOrder: 999,
    },
    update: {},
  });

  const admin = await prisma.membership.findFirst({
    where: { role: "admin", status: "active" },
    select: { userId: true },
  });

  return prisma.post.create({
    data: {
      spaceId: space.id,
      authorId: admin?.userId ?? lesson.authorFallbackId,
      title: `Comentários: ${lesson.title}`,
      body: `Discussão da aula **${lesson.title}**. Comente abaixo.`,
      linkUrl: marker,
    },
  });
}

export async function getLessonPathById(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      slug: true,
      module: { select: { slug: true } },
    },
  });
  if (!lesson) return null;
  return `/aulas/${lesson.module.slug}/${lesson.slug}`;
}
