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
  addAllowedEmailsBulk,
  removeAllowedEmail,
} from "@/lib/membership/allowlist";
import { prisma } from "@/lib/db";
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  lessonSchema,
  moduleSchema,
  updateLesson,
  updateModule,
} from "@/lib/aulas";

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
  const admin = await requireAdmin();
  await setMembershipRole(admin.user.id, userId, role);
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

export async function bulkAddAllowedEmailsAction(
  formData: FormData,
): Promise<{ added: number; existing: number; invalid: string[] }> {
  await requireAdmin();
  const raw = String(formData.get("emails") ?? "");
  const result = await addAllowedEmailsBulk(raw, "admin-bulk");

  for (const email of raw.split(/[\n,;]+/).map((e) => e.trim().toLowerCase())) {
    if (!email.includes("@")) continue;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const m = await prisma.membership.findUnique({
        where: { userId: user.id },
      });
      if (m?.status === "pending") {
        await setMembershipStatus(user.id, "active");
      }
    }
  }

  revalidatePath("/admin");
  return result;
}

export async function createModuleAction(formData: FormData) {
  await requireAdmin();
  const raw = {
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    coverImageUrl: String(formData.get("coverImageUrl") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: formData.get("published") === "on",
  };
  moduleSchema.parse(raw);
  await createModule(raw);
  revalidatePath("/admin");
  revalidatePath("/aulas");
}

export async function updateModuleAction(id: string, formData: FormData) {
  await requireAdmin();
  const raw = {
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    coverImageUrl: String(formData.get("coverImageUrl") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: formData.get("published") === "on",
  };
  moduleSchema.parse(raw);
  await updateModule(id, raw);
  revalidatePath("/admin");
  revalidatePath("/aulas");
}

export async function deleteModuleAction(id: string) {
  await requireAdmin();
  await deleteModule(id);
  revalidatePath("/admin");
  revalidatePath("/aulas");
}

export async function createLessonAction(formData: FormData) {
  await requireAdmin();
  const raw = {
    moduleId: String(formData.get("moduleId") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    pandaVideoExternalId: String(formData.get("pandaVideoExternalId") ?? ""),
    pandaLibraryId: String(formData.get("pandaLibraryId") ?? ""),
    thumbnailUrl: String(formData.get("thumbnailUrl") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: formData.get("published") === "on",
  };
  lessonSchema.parse(raw);
  await createLesson(raw);
  revalidatePath("/admin");
  revalidatePath("/aulas");
}

export async function updateLessonAction(id: string, formData: FormData) {
  await requireAdmin();
  const raw = {
    moduleId: String(formData.get("moduleId") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    pandaVideoExternalId: String(formData.get("pandaVideoExternalId") ?? ""),
    pandaLibraryId: String(formData.get("pandaLibraryId") ?? ""),
    thumbnailUrl: String(formData.get("thumbnailUrl") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: formData.get("published") === "on",
  };
  lessonSchema.parse(raw);
  await updateLesson(id, raw);
  revalidatePath("/admin");
  revalidatePath("/aulas");
}

export async function deleteLessonAction(id: string) {
  await requireAdmin();
  await deleteLesson(id);
  revalidatePath("/admin");
  revalidatePath("/aulas");
}
