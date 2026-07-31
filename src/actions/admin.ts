"use server";

import { revalidatePath } from "next/cache";
import type { MembershipStatus, Role } from "@prisma/client";
import { requireAdmin } from "@/lib/membership/require-member";
import {
  createSpace,
  deleteSpace,
  spaceSchema,
  updateSpace,
} from "@/lib/spaces";
import {
  setMembershipRole,
  setMembershipStatus,
} from "@/lib/admin/members";
import {
  addAllowedEmail,
  removeAllowedEmail,
} from "@/lib/membership/allowlist";
import { prisma } from "@/lib/db";

export async function createSpaceAction(formData: FormData) {
  await requireAdmin();
  const raw = {
    slug: String(formData.get("slug") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 99),
  };
  spaceSchema.parse(raw);
  await createSpace(raw);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function updateSpaceAction(id: string, formData: FormData) {
  await requireAdmin();
  const raw = {
    slug: String(formData.get("slug") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };
  spaceSchema.parse(raw);
  await updateSpace(id, raw);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteSpaceAction(id: string) {
  await requireAdmin();
  await deleteSpace(id);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function setMemberStatusAction(
  userId: string,
  status: MembershipStatus,
) {
  await requireAdmin();
  await setMembershipStatus(userId, status);
  revalidatePath("/admin");
}

export async function setMemberRoleAction(userId: string, role: Role) {
  await requireAdmin();
  await setMembershipRole(userId, role);
  revalidatePath("/admin");
}

export async function addAllowedEmailAction(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "");
  await addAllowedEmail({ email, source: "admin" });

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (user) {
    const m = await prisma.membership.findUnique({ where: { userId: user.id } });
    if (m?.status === "pending") {
      await setMembershipStatus(user.id, "active");
    }
  }

  revalidatePath("/admin");
}

export async function removeAllowedEmailAction(email: string) {
  await requireAdmin();
  await removeAllowedEmail(email);
  revalidatePath("/admin");
}
