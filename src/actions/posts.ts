"use server";

import { revalidatePath } from "next/cache";
import { requireActiveMember, requireAdmin } from "@/lib/membership/require-member";
import {
  createPost,
  createPostSchema,
  deletePost,
  setPostPinned,
} from "@/lib/posts";

export async function createPostAction(formData: FormData) {
  const { user } = await requireActiveMember();
  const raw = {
    spaceId: String(formData.get("spaceId") ?? ""),
    body: String(formData.get("body") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? "") || null,
    linkUrl: String(formData.get("linkUrl") ?? "") || null,
    videoUrl: String(formData.get("videoUrl") ?? "") || null,
  };
  createPostSchema.parse(raw);
  const post = await createPost(user.id, raw);
  revalidatePath("/");
  revalidatePath(`/spaces/${post.space.slug}`);
  return { id: post.id };
}

export async function deletePostAction(postId: string, spaceSlug: string) {
  await requireAdmin();
  await deletePost(postId);
  revalidatePath("/");
  revalidatePath(`/spaces/${spaceSlug}`);
  revalidatePath("/admin");
}

export async function togglePinAction(
  postId: string,
  spaceSlug: string,
  pinned: boolean,
) {
  await requireAdmin();
  await setPostPinned(postId, pinned);
  revalidatePath("/");
  revalidatePath(`/spaces/${spaceSlug}`);
}
