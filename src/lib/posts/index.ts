import { z } from "zod";
import { prisma } from "@/lib/db";
import { notifyMany } from "@/lib/notifications";
import { resolveMentionedUserIds } from "@/lib/mentions";
import { titleFromBody } from "@/lib/posts/title";
import { optionalHttpsUrl } from "@/lib/security/urls";

export const createPostSchema = z.object({
  spaceId: z.string().min(1),
  body: z.string().trim().min(1).max(10000),
  imageUrl: optionalHttpsUrl,
  linkUrl: optionalHttpsUrl,
  videoUrl: optionalHttpsUrl,
});

const postListIncludeBase = {
  author: {
    include: { profile: true },
  },
  space: true,
} as const;

const postInclude = {
  ...postListIncludeBase,
  reactions: { select: { userId: true } },
} as const;

export async function listPosts(opts: {
  spaceId?: string;
  /** Exclui spaces por slug (ex.: boas-vindas no Feed global). */
  excludeSpaceSlugs?: string[];
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
    },
    include: {
      ...postListIncludeBase,
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
    orderBy: [{ pinnedAt: "desc" }, { createdAt: "desc" }],
    take: take + 1,
    ...(opts.cursor
      ? { cursor: { id: opts.cursor }, skip: 1 }
      : {}),
  });

  let nextCursor: string | undefined;
  if (posts.length > take) {
    const next = posts.pop();
    nextCursor = next?.id;
  }

  return { posts, nextCursor };
}

export async function getPost(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      ...postInclude,
      comments: {
        where: { parentId: null },
        include: {
          author: { include: { profile: true } },
          replies: {
            include: { author: { include: { profile: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      reactions: { select: { userId: true, type: true } },
    },
  });
}

export async function createPost(
  authorId: string,
  raw: z.infer<typeof createPostSchema>,
) {
  const data = createPostSchema.parse(raw);
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

export async function deletePost(id: string) {
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
    await prisma.$transaction(async (tx) => {
      await tx.postView.create({
        data: { postId, userId },
      });
      await tx.post.update({
        where: { id: postId },
        data: { viewCount: { increment: 1 } },
      });
    });
  } catch {
    // unique violation = já leu
  }

  const fresh = await prisma.post.findUnique({
    where: { id: postId },
    select: { viewCount: true },
  });
  return fresh?.viewCount ?? post.viewCount;
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
