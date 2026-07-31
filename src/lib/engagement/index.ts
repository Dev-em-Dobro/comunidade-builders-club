import { z } from "zod";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export const createCommentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().trim().min(1).max(5000),
});

export async function createComment(
  authorId: string,
  raw: z.infer<typeof createCommentSchema>,
) {
  const data = createCommentSchema.parse(raw);

  const post = await prisma.post.findUnique({ where: { id: data.postId } });
  if (!post) throw new Error("Post não encontrado.");

  const comment = await prisma.$transaction(async (tx) => {
    const c = await tx.comment.create({
      data: {
        postId: data.postId,
        authorId,
        body: data.body,
      },
      include: { author: { include: { profile: true } } },
    });
    await tx.post.update({
      where: { id: data.postId },
      data: { commentCount: { increment: 1 } },
    });
    return c;
  });

  if (post.authorId !== authorId) {
    await createNotification({
      recipientId: post.authorId,
      actorId: authorId,
      type: "comment_on_post",
      postId: post.id,
      commentId: comment.id,
    });
  }

  return comment;
}

export async function deleteComment(id: string) {
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return;

  await prisma.$transaction(async (tx) => {
    await tx.comment.delete({ where: { id } });
    await tx.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
    });
  });
}

export async function togglePostReaction(userId: string, postId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post não encontrado.");

  const existing = await prisma.reaction.findFirst({
    where: { userId, postId, type: "like" },
  });

  if (existing) {
    await prisma.$transaction(async (tx) => {
      await tx.reaction.delete({ where: { id: existing.id } });
      await tx.post.update({
        where: { id: postId },
        data: { reactionCount: { decrement: 1 } },
      });
    });
    return { liked: false };
  }

  await prisma.$transaction(async (tx) => {
    await tx.reaction.create({
      data: { userId, postId, type: "like" },
    });
    await tx.post.update({
      where: { id: postId },
      data: { reactionCount: { increment: 1 } },
    });
  });

  if (post.authorId !== userId) {
    await createNotification({
      recipientId: post.authorId,
      actorId: userId,
      type: "reaction_on_post",
      postId,
    });
  }

  return { liked: true };
}
