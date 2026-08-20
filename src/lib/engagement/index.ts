import { z } from "zod";
import { prisma } from "@/lib/db";
import { ForbiddenError } from "@/lib/auth/errors";
import { createNotification, notifyMany } from "@/lib/notifications";
import { resolveMentionedUserIds } from "@/lib/mentions";
import { isCommentsDisabledSpace } from "@/lib/spaces/constants";

export const createCommentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().trim().min(1).max(5000),
  parentId: z.string().min(1).optional().nullable(),
});

export async function createComment(
  authorId: string,
  raw: z.infer<typeof createCommentSchema>,
) {
  const data = createCommentSchema.parse(raw);

  const post = await prisma.post.findUnique({
    where: { id: data.postId },
    include: { space: { select: { slug: true } } },
  });
  if (!post) throw new Error("Post não encontrado.");
  if (isCommentsDisabledSpace(post.space.slug)) {
    throw new ForbiddenError(
      "Comentários estão desativados neste espaço.",
    );
  }

  let parentAuthorId: string | null = null;
  if (data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: data.parentId },
    });
    if (!parent || parent.postId !== data.postId) {
      throw new Error("Comentário pai inválido.");
    }
    if (parent.parentId) {
      throw new Error("Só é permitido um nível de resposta.");
    }
    parentAuthorId = parent.authorId;
  }

  const comment = await prisma.$transaction(async (tx) => {
    const c = await tx.comment.create({
      data: {
        postId: data.postId,
        authorId,
        body: data.body,
        parentId: data.parentId || null,
      },
      include: { author: { include: { profile: true } } },
    });
    await tx.post.update({
      where: { id: data.postId },
      data: { commentCount: { increment: 1 } },
    });
    return c;
  });

  if (data.parentId && parentAuthorId && parentAuthorId !== authorId) {
    await createNotification({
      recipientId: parentAuthorId,
      actorId: authorId,
      type: "reply_on_comment",
      postId: post.id,
      commentId: comment.id,
      snippet: data.body,
    });
  } else if (post.authorId !== authorId) {
    await createNotification({
      recipientId: post.authorId,
      actorId: authorId,
      type: "comment_on_post",
      postId: post.id,
      commentId: comment.id,
      snippet: data.body,
    });
  }

  const mentioned = await resolveMentionedUserIds(data.body, authorId);
  const skip = new Set(
    [authorId, post.authorId, parentAuthorId].filter(Boolean) as string[],
  );
  await notifyMany(
    mentioned.filter((id) => !skip.has(id)),
    {
      actorId: authorId,
      type: "mention_in_comment",
      postId: post.id,
      commentId: comment.id,
      snippet: data.body,
    },
  );

  return comment;
}

export async function deleteComment(id: string) {
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { replies: { select: { id: true } } },
  });
  if (!comment) return;

  const decrement = 1 + comment.replies.length;

  await prisma.$transaction(async (tx) => {
    await tx.comment.delete({ where: { id } });
    await tx.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement } },
    });
  });
}

export const updateCommentSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

export async function updateComment(
  id: string,
  actorId: string,
  isAdmin: boolean,
  raw: z.infer<typeof updateCommentSchema>,
) {
  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) throw new Error("Comentário não encontrado.");
  if (!isAdmin && existing.authorId !== actorId) {
    throw new ForbiddenError("Você só pode editar seus próprios comentários.");
  }
  const data = updateCommentSchema.parse(raw);
  return prisma.comment.update({
    where: { id },
    data: { body: data.body },
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
      snippet: post.body,
    });
  }

  return { liked: true };
}
