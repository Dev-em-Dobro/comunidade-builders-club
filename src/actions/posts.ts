"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requireActiveMember, requireAdmin } from "@/lib/membership/require-member";
import {
  createPost,
  createPostSchema,
  deletePost,
  setPostPinned,
  updatePost,
  updatePostSchema,
} from "@/lib/posts";

function actionError(e: unknown): never {
  if (e instanceof ZodError) {
    throw new Error(e.errors[0]?.message ?? "Dados inválidos.");
  }
  if (e instanceof Error) throw e;
  throw new Error("Operação falhou.");
}

export async function createPostAction(formData: FormData) {
  const { user, membership } = await requireActiveMember();
  const isAdmin = membership.role === "admin";
  const raw = {
    spaceId: String(formData.get("spaceId") ?? ""),
    body: String(formData.get("body") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? "") || null,
    linkUrl: String(formData.get("linkUrl") ?? "") || null,
    videoUrl: String(formData.get("videoUrl") ?? "") || null,
  };
  try {
    createPostSchema.parse(raw);
    const post = await createPost(user.id, raw, { isAdmin });
    revalidatePath("/");
    revalidatePath(`/spaces/${post.space.slug}`);
    revalidatePath("/nova");
    return { id: post.id, spaceSlug: post.space.slug };
  } catch (e) {
    actionError(e);
  }
}

export async function updatePostAction(formData: FormData) {
  const { user, membership } = await requireActiveMember();
  const isAdmin = membership.role === "admin";
  const postId = String(formData.get("postId") ?? "");
  const raw = {
    body: String(formData.get("body") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? "") || null,
    linkUrl: String(formData.get("linkUrl") ?? "") || null,
    videoUrl: String(formData.get("videoUrl") ?? "") || null,
  };
  try {
    updatePostSchema.parse(raw);
    const post = await updatePost(postId, user.id, isAdmin, raw);
    revalidatePath("/");
    revalidatePath(`/spaces/${post.space.slug}`);
    revalidatePath(`/posts/${post.id}`);
    return { id: post.id };
  } catch (e) {
    actionError(e);
  }
}

export async function deletePostAction(postId: string, spaceSlug: string) {
  const { user, membership } = await requireActiveMember();
  const isAdmin = membership.role === "admin";
  try {
    await deletePost(postId, user.id, isAdmin);
  } catch (e) {
    actionError(e);
  }
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
