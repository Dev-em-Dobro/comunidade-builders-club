"use server";

import { revalidatePath } from "next/cache";
import { requireActiveMember, requireAdmin } from "@/lib/membership/require-member";
import {
  createComment,
  createCommentSchema,
  deleteComment,
  togglePostReaction,
} from "@/lib/engagement";

export async function createCommentAction(formData: FormData) {
  const { user } = await requireActiveMember();
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

export async function deleteCommentAction(commentId: string, postId: string) {
  await requireAdmin();
  await deleteComment(commentId);
  revalidatePath(`/posts/${postId}`);
}

export async function toggleReactionAction(postId: string) {
  const { user } = await requireActiveMember();
  const result = await togglePostReaction(user.id, postId);
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
  return result;
}
