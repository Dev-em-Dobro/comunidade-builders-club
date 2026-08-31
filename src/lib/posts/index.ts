import { z } from "zod";
import { prisma } from "@/lib/db";
import { notifyMany } from "@/lib/notifications";
import { maybeSendGroupedReplyEmails } from "@/lib/notifications/enviar-resposta";
import { resolveMentionedUserIds } from "@/lib/mentions";
import { titleFromBody } from "@/lib/posts/title";
import { optionalHttpsUrl, optionalMediaUrl } from "@/lib/security/urls";
import { isAdminOnlyPublishSpace, isFreePublishSpace, PRESENTES_SPACE_SLUG } from "@/lib/spaces/constants";
import { assertSemCtaNoCorpo } from "@/lib/gifts/cta-no-corpo";
import { ForbiddenError } from "@/lib/auth/errors";
import { UPGRADE_REQUIRED } from "@/lib/membership/errors";
import { Prisma } from "@prisma/client";

export const giftPostSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: minúsculas, números e hífens");

export const createPostSchema = z.object({
  spaceId: z.string().min(1),
  body: z.string().trim().min(1).max(10000),
  imageUrl: optionalMediaUrl,
  linkUrl: optionalHttpsUrl,
  videoUrl: optionalMediaUrl,
  slug: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null) return null;
      const trimmed = String(v).trim();
      if (!trimmed) return null;
      return giftPostSlugSchema.parse(trimmed);
    }),
});

export const updatePostSchema = z.object({
  body: z.string().trim().min(1).max(10000),
  imageUrl: optionalMediaUrl,
  linkUrl: optionalHttpsUrl,
  videoUrl: optionalMediaUrl,
});

const postListSelect = {
  id: true,
  spaceId: true,
  authorId: true,
  title: true,
  body: true,
  imageUrl: true,
  linkUrl: true,
  videoUrl: true,
  pinnedAt: true,
  commentCount: true,
  reactionCount: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      profile: {
        select: { displayName: true, avatarUrl: true },
      },
    },
  },
  space: {
    select: { id: true, slug: true, name: true },
  },
} as const;

const postListIncludeBase = {
  author: {
    select: {
      id: true,
      profile: {
        select: { displayName: true, avatarUrl: true },
      },
    },
  },
  space: {
    select: { id: true, slug: true, name: true },
  },
} as const;

const postInclude = {
  ...postListIncludeBase,
  reactions: { select: { userId: true } },
} as const;

export async function listPosts(opts: {
  spaceId?: string;
  /** Exclui spaces por slug (ex.: boas-vindas no Feed global). */
  excludeSpaceSlugs?: string[];
  /** Inclui só estes slugs (ex.: feed free). */
  includeSpaceSlugs?: string[];
  /** Se informado, carrega só a reação deste usuário (liked). */
  viewerId?: string;
  cursor?: string;
  take?: number;
}) {
  const take = opts.take ?? 20;
  const posts = await prisma.post.findMany({
    where: {
      ...(opts.spaceId ? { spaceId: opts.spaceId } : {}),
      ...(opts.excludeSpaceSlugs?.length
        ? { space: { slug: { notIn: opts.excludeSpaceSlugs } } }
        : {}),
      ...(opts.includeSpaceSlugs?.length
        ? { space: { slug: { in: opts.includeSpaceSlugs } } }
        : {}),
    },
    select: {
      ...postListSelect,
      ...(opts.viewerId
        ? {
            reactions: {
              where: { userId: opts.viewerId },
              select: { userId: true },
              take: 1,
            },
          }
        : {}),
    },
    // Postgres: DESC coloca NULL primeiro — nulls:last mantém fixados no topo.
    orderBy: [
      { pinnedAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
    take: take + 1,
    ...(opts.cursor
      ? { cursor: { id: opts.cursor }, skip: 1 }
      : {}),
  });

  // Entre fixados (e entre não-fixados), ordenar só por createdAt desc.
  posts.sort((a, b) => {
    const aPinned = a.pinnedAt ? 1 : 0;
    const bPinned = b.pinnedAt ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  let nextCursor: string | undefined;
  if (posts.length > take) {
    const next = posts.pop();
    nextCursor = next?.id;
  }

  return { posts, nextCursor };
}

export async function getPost(id: string, opts?: { viewerId?: string }) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          profile: {
            select: { displayName: true, avatarUrl: true },
          },
        },
      },
      space: {
        select: { id: true, slug: true, name: true },
      },
      comments: {
        where: { parentId: null },
        include: {
          author: {
            select: {
              id: true,
              profile: {
                select: { displayName: true, avatarUrl: true },
              },
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  profile: {
                    select: { displayName: true, avatarUrl: true },
                  },
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      reactions: opts?.viewerId
        ? {
            where: { userId: opts.viewerId },
            select: { userId: true, type: true },
            take: 1,
          }
        : { select: { userId: true, type: true } },
    },
  });
}

async function assertCanPostToSpace(
  spaceId: string,
  opts: { isAdmin: boolean; isPaid: boolean },
) {
  const space = await prisma.space.findUnique({ where: { id: spaceId } });
  if (!space) throw new Error("Space não encontrado.");
  if (isAdminOnlyPublishSpace(space.slug) && !opts.isAdmin) {
    throw new ForbiddenError(
      "Apenas administradores podem publicar neste space.",
    );
  }
  if (!opts.isPaid && !opts.isAdmin && !isFreePublishSpace(space.slug)) {
    throw new ForbiddenError(UPGRADE_REQUIRED);
  }
  return space;
}

export async function createPost(
  authorId: string,
  raw: z.infer<typeof createPostSchema>,
  opts: { isAdmin: boolean; isPaid: boolean },
) {
  const data = createPostSchema.parse(raw);
  const space = await assertCanPostToSpace(data.spaceId, opts);
  /**
   * F070 — o corpo do Presente termina no assunto. O CTA final é do app e
   * varia por sessão; escrito no markdown ele não varia. Vale para todo o
   * space, com ou sem slug: o slug decide se a página é pública, não se o
   * texto é um Presente.
   */
  if (space.slug === PRESENTES_SPACE_SLUG) {
    assertSemCtaNoCorpo(data.body);
  }
  let slug: string | null = null;
  if (data.slug) {
    if (!opts.isAdmin || space.slug !== PRESENTES_SPACE_SLUG) {
      throw new ForbiddenError(
        "Slug público só vale em Presentes, publicado por admin.",
      );
    }
    slug = data.slug;
  }
  const title = titleFromBody(data.body);
  try {
    const post = await prisma.post.create({
      data: {
        authorId,
        spaceId: data.spaceId,
        title,
        body: data.body,
        slug,
        imageUrl: data.imageUrl || null,
        linkUrl: data.linkUrl || null,
        videoUrl: data.videoUrl || null,
      },
      include: postInclude,
    });

    const mentioned = await resolveMentionedUserIds(data.body, authorId);
    await notifyMany(mentioned, {
      actorId: authorId,
      type: "mention_in_post",
      postId: post.id,
      snippet: data.body,
    });
    if (mentioned.length > 0) {
      await maybeSendGroupedReplyEmails({
        recipientIds: mentioned,
        actorId: authorId,
        actorName: post.author.profile?.displayName ?? "Alguém",
        postId: post.id,
        snippet: data.body,
      });
    }

    return post;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("Este slug de presente já está em uso.");
    }
    throw e;
  }
}

export async function updatePost(
  id: string,
  authorId: string,
  isAdmin: boolean,
  raw: z.infer<typeof updatePostSchema>,
  opts: { isPaid: boolean },
) {
  const existing = await prisma.post.findUnique({
    where: { id },
    include: { space: { select: { slug: true } } },
  });
  if (!existing) throw new Error("Post não encontrado.");
  if (!isAdmin && existing.authorId !== authorId) {
    throw new ForbiddenError("Você só pode editar seus próprios posts.");
  }
  if (!opts.isPaid && !isAdmin && !isFreePublishSpace(existing.space.slug)) {
    throw new ForbiddenError(UPGRADE_REQUIRED);
  }
  const data = updatePostSchema.parse(raw);
  /**
   * F070 — editar passa pelo mesmo gate de publicar. Sem isto o corpo entra
   * limpo e ganha o CTA no primeiro update, que é como uma regra "de
   * publicação" morre.
   */
  if (existing.space.slug === PRESENTES_SPACE_SLUG) {
    assertSemCtaNoCorpo(data.body);
  }
  const title = titleFromBody(data.body);
  return prisma.post.update({
    where: { id },
    data: {
      title,
      body: data.body,
      imageUrl: data.imageUrl || null,
      linkUrl: data.linkUrl || null,
      videoUrl: data.videoUrl || null,
    },
    include: postInclude,
  });
}

export async function deletePost(
  id: string,
  actorId: string,
  isAdmin: boolean,
  opts: { isPaid: boolean },
) {
  const existing = await prisma.post.findUnique({
    where: { id },
    include: { space: { select: { slug: true } } },
  });
  if (!existing) throw new Error("Post não encontrado.");
  if (!isAdmin && existing.authorId !== actorId) {
    throw new ForbiddenError("Você só pode remover seus próprios posts.");
  }
  if (!opts.isPaid && !isAdmin && !isFreePublishSpace(existing.space.slug)) {
    throw new ForbiddenError(UPGRADE_REQUIRED);
  }
  return prisma.post.delete({ where: { id } });
}

export async function setPostPinned(id: string, pinned: boolean) {
  return prisma.post.update({
    where: { id },
    data: { pinnedAt: pinned ? new Date() : null },
  });
}

/** Registra leitura única; autor não conta. Retorna viewCount atualizado. */
export async function recordPostView(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, viewCount: true },
  });
  if (!post) return null;
  if (post.authorId === userId) return post.viewCount;

  try {
    await prisma.postView.create({ data: { postId, userId } });
    const updated = await prisma.post.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });
    return updated.viewCount;
  } catch {
    // unique violation = já leu
    return post.viewCount;
  }
}

export async function backfillEmptyTitles() {
  const posts = await prisma.post.findMany({
    where: { OR: [{ title: "" }, { title: { equals: "" } }] },
    select: { id: true, body: true },
  });
  for (const p of posts) {
    await prisma.post.update({
      where: { id: p.id },
      data: { title: titleFromBody(p.body) },
    });
  }
  return posts.length;
}
