import { z } from "zod";
import { prisma } from "@/lib/db";
import { notifyMany } from "@/lib/notifications";
import { resolveMentionedUserIds } from "@/lib/mentions";
import { titleFromBody } from "@/lib/posts/title";
import { optionalHttpsUrl, optionalMediaUrl } from "@/lib/security/urls";
import { isAdminOnlyPublishSpace } from "@/lib/spaces/constants";
import { ForbiddenError } from "@/lib/auth/errors";

export const createPostSchema = z.object({
  spaceId: z.string().min(1),
  body: z.string().trim().min(1).max(10000),
  imageUrl: optionalMediaUrl,
  linkUrl: optionalHttpsUrl,
  videoUrl: optionalMediaUrl,
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

async function assertCanPostToSpace(spaceId: string, isAdmin: boolean) {
  const space = await prisma.space.findUnique({ where: { id: spaceId } });
  if (!space) throw new Error("Space não encontrado.");
  if (isAdminOnlyPublishSpace(space.slug) && !isAdmin) {
    throw new ForbiddenError(
      "Apenas administradores podem publicar neste space.",
    );
  }
  return space;
}

export async function createPost(
  authorId: string,
  raw: z.infer<typeof createPostSchema>,
  opts: { isAdmin: boolean },
) {
  const data = createPostSchema.parse(raw);
  await assertCanPostToSpace(data.spaceId, opts.isAdmin);
  const title = titleFromBody(data.body);
  const post = await prisma.post.create({
    data: {
      authorId,
      spaceId: data.spaceId,
      title,
      body: data.body,
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

  return post;
}

export async function updatePost(
  id: string,
  authorId: string,
  isAdmin: boolean,
  raw: z.infer<typeof updatePostSchema>,
) {
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) throw new Error("Post não encontrado.");
  if (!isAdmin && existing.authorId !== authorId) {
    throw new ForbiddenError("Você só pode editar seus próprios posts.");
  }
  const data = updatePostSchema.parse(raw);
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
) {
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) throw new Error("Post não encontrado.");
  if (!isAdmin && existing.authorId !== actorId) {
    throw new ForbiddenError("Você só pode remover seus próprios posts.");
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
