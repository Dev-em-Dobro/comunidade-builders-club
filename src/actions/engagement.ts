"use server";

import { revalidatePath } from "next/cache";
import {
  requireAdmin,
  requireActiveMember,
  requirePaidMember,
} from "@/lib/membership/require-member";
import { isPaidMembership } from "@/lib/membership/capabilities";
import {
  createComment,
  createCommentSchema,
  deleteComment,
  togglePostReaction,
  updateComment,
  updateCommentSchema,
} from "@/lib/engagement";

export async function createCommentAction(formData: FormData) {
  const { user, membership } = await requireActiveMember();
  const parentRaw = String(formData.get("parentId") ?? "").trim();
  const raw = {
    postId: String(formData.get("postId") ?? ""),
    body: String(formData.get("body") ?? ""),
    parentId: parentRaw || null,
  };
  createCommentSchema.parse(raw);
  await createComment(user.id, raw, {
    isPaid: isPaidMembership(membership),
  });
  revalidatePath(`/posts/${raw.postId}`);
  revalidatePath("/");
  revalidatePath("/aulas", "layout");
}

export async function updateCommentAction(formData: FormData) {
  const { user, membership } = await requireActiveMember();
  const commentId = String(formData.get("commentId") ?? "");
  const postId = String(formData.get("postId") ?? "");
  const raw = { body: String(formData.get("body") ?? "") };
  updateCommentSchema.parse(raw);
  const isAdmin = membership.role === "admin";
  await updateComment(commentId, user.id, isAdmin, raw, {
    isPaid: isPaidMembership(membership),
  });
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/aulas", "layout");
}

export async function deleteCommentAction(commentId: string, postId: string) {
  await requireAdmin();
  await deleteComment(commentId);
  revalidatePath(`/posts/${postId}`);
}

export async function toggleReactionAction(postId: string) {
  const { user } = await requirePaidMember();
  const result = await togglePostReaction(user.id, postId);
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
  return result;
}
