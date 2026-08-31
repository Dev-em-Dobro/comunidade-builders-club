import { z } from "zod";
import { prisma } from "@/lib/db";
import { ForbiddenError } from "@/lib/auth/errors";
import { createNotification } from "@/lib/notifications";
import { maybeSendGroupedReplyEmails } from "@/lib/notifications/enviar-resposta";
import { planCommentNotifications } from "@/lib/notifications/regras";
import { resolveMentionedUserIds } from "@/lib/mentions";
import { isCommentsDisabledSpace, isFreeCommentSpace } from "@/lib/spaces/constants";
import { UPGRADE_REQUIRED } from "@/lib/membership/errors";

export const createCommentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().trim().min(1).max(5000),
  parentId: z.string().min(1).optional().nullable(),
});

export async function createComment(
  authorId: string,
  raw: z.infer<typeof createCommentSchema>,
  opts: { isPaid: boolean },
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
  if (!opts.isPaid && !isFreeCommentSpace(post.space.slug)) {
    throw new ForbiddenError(UPGRADE_REQUIRED);
  }

  let threadParentId: string | null = data.parentId || null;
  let replyTargetAuthorId: string | null = null;

  if (data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: data.parentId },
    });
    if (!parent || parent.postId !== data.postId) {
      throw new Error("Comentário pai inválido.");
    }
    // F006 — UI 1 nível: responder a uma resposta entra no mesmo fio (raiz).
    if (parent.parentId) {
      threadParentId = parent.parentId;
      replyTargetAuthorId = parent.authorId;
    } else {
      threadParentId = parent.id;
      replyTargetAuthorId = parent.authorId;
    }
  }

  const comment = await prisma.$transaction(async (tx) => {
    const c = await tx.comment.create({
      data: {
        postId: data.postId,
        authorId,
        body: data.body,
        parentId: threadParentId,
      },
      include: { author: { include: { profile: true } } },
    });
    await tx.post.update({
      where: { id: data.postId },
      data: { commentCount: { increment: 1 } },
    });
    return c;
  });

  const mentioned = await resolveMentionedUserIds(data.body, authorId);
  const plans = planCommentNotifications({
    actorId: authorId,
    postAuthorId: post.authorId,
    replyTargetAuthorId,
    mentionedIds: mentioned,
  });

  for (const plan of plans) {
    await createNotification({
      recipientId: plan.recipientId,
      actorId: authorId,
      type: plan.type,
      postId: post.id,
      commentId: comment.id,
      snippet: data.body,
    });
  }

  await maybeSendGroupedReplyEmails({
    recipientIds: plans.map((p) => p.recipientId),
    actorId: authorId,
    actorName: comment.author.profile?.displayName ?? "Alguém",
    postId: post.id,
    snippet: data.body,
  });

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
  opts: { isPaid: boolean },
) {
  const existing = await prisma.comment.findUnique({
    where: { id },
    include: { post: { select: { space: { select: { slug: true } } } } },
  });
  if (!existing) throw new Error("Comentário não encontrado.");
  if (!isAdmin && existing.authorId !== actorId) {
    throw new ForbiddenError("Você só pode editar seus próprios comentários.");
  }
  if (!opts.isPaid && !isAdmin && !isFreeCommentSpace(existing.post.space.slug)) {
    throw new ForbiddenError(UPGRADE_REQUIRED);
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
