import { z } from "zod";
import { prisma } from "@/lib/db";

export const createPostSchema = z.object({
  spaceId: z.string().min(1),
  body: z.string().trim().min(1).max(10000),
  imageUrl: z.string().url().max(2000).optional().nullable().or(z.literal("")),
  linkUrl: z.string().url().max(2000).optional().nullable().or(z.literal("")),
  videoUrl: z.string().url().max(2000).optional().nullable().or(z.literal("")),
});

const postInclude = {
  author: {
    include: { profile: true },
  },
  space: true,
} as const;

export async function listPosts(opts: {
  spaceId?: string;
  cursor?: string;
  take?: number;
}) {
  const take = opts.take ?? 20;
  const posts = await prisma.post.findMany({
    where: opts.spaceId ? { spaceId: opts.spaceId } : undefined,
    include: postInclude,
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
        include: { author: { include: { profile: true } } },
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
  return prisma.post.create({
    data: {
      authorId,
      spaceId: data.spaceId,
      body: data.body,
      imageUrl: data.imageUrl || null,
      linkUrl: data.linkUrl || null,
      videoUrl: data.videoUrl || null,
    },
    include: postInclude,
  });
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
