"use server";

import { revalidatePath } from "next/cache";
import {
  requireActiveMember,
  requireAdmin,
  requirePaidMember,
} from "@/lib/membership/require-member";
import {
  createComment,
  createCommentSchema,
  deleteComment,
  togglePostReaction,
  updateComment,
  updateCommentSchema,
} from "@/lib/engagement";

export async function createCommentAction(formData: FormData) {
  const { user } = await requirePaidMember();
  const parentRaw = String(formData.get("parentId") ?? "").trim();
  const raw = {
    postId: String(formData.get("postId") ?? ""),
    body: String(formData.get("body") ?? ""),
    parentId: parentRaw || null,
  };
  createCommentSchema.parse(raw);
  await createComment(user.id, raw);
  revalidatePath(`/posts/${raw.postId}`);
  revalidatePath("/");
  revalidatePath("/aulas", "layout");
}

export async function updateCommentAction(formData: FormData) {
  const { user, membership } = await requirePaidMember();
  const commentId = String(formData.get("commentId") ?? "");
  const postId = String(formData.get("postId") ?? "");
  const raw = { body: String(formData.get("body") ?? "") };
  updateCommentSchema.parse(raw);
  const isAdmin = membership.role === "admin";
  await updateComment(commentId, user.id, isAdmin, raw);
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/aulas", "layout");
}

export async function deleteCommentAction(commentId: string, postId: string) {
  await requireAdmin();
  await deleteComment(commentId);
  revalidatePath(`/posts/${postId}`);
}

/** F063 — reagir é livre para free; comentar segue exigindo PRO. */
export async function toggleReactionAction(postId: string) {
  const { user } = await requireActiveMember();
  const result = await togglePostReaction(user.id, postId);
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
  return result;
}
