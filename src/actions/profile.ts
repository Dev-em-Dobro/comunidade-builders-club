"use server";

import { revalidatePath } from "next/cache";
import { requireActiveMember } from "@/lib/membership/require-member";
import { updateProfile, updateProfileSchema } from "@/lib/profile";

export async function updateProfileAction(formData: FormData) {
  const { user } = await requireActiveMember();
  const raw = {
    displayName: String(formData.get("displayName") ?? ""),
    bio: String(formData.get("bio") ?? "") || null,
    avatarUrl: String(formData.get("avatarUrl") ?? "") || null,
  };
  updateProfileSchema.parse(raw);
  await updateProfile(user.id, raw);
  revalidatePath("/perfil");
  revalidatePath("/");
}
