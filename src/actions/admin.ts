"use server";

import { revalidatePath, revalidateTag } from "next/cache";
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
import { markDeniedLoginsResolved } from "@/lib/admin/denied-logins";
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
  moveLesson,
  moveModule,
  setModuleFreeAccess,
} from "@/lib/aulas";
import { atualizarLiveSchedule } from "@/lib/live";

function bustSpacesCache() {
  revalidateTag("spaces");
  revalidatePath("/admin");
  revalidatePath("/");
}

function bustAulasCache() {
  revalidateTag("aulas");
  revalidatePath("/admin");
  revalidatePath("/admin", "layout");
  revalidatePath("/aulas");
  revalidatePath("/aulas", "layout");
  revalidatePath("/admin/progresso");
}

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
  bustSpacesCache();
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
  bustSpacesCache();
}

export async function deleteSpaceAction(id: string) {
  await requireAdmin();
  await deleteSpace(id);
  bustSpacesCache();
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
  await addAllowedEmail({ email, source: "manual" });

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
    freeAccess: formData.get("freeAccess") === "on",
    parentId: String(formData.get("parentId") ?? "") || null,
  };
  moduleSchema.parse(raw);
  await createModule(raw);
  bustAulasCache();
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
    freeAccess: formData.get("freeAccess") === "on",
    parentId: String(formData.get("parentId") ?? "") || null,
  };
  moduleSchema.parse(raw);
  await updateModule(id, raw);
  bustAulasCache();
}

export async function setModuleFreeAccessAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Módulo inválido.");
  const freeAccess = formData.get("freeAccess") === "true";
  await setModuleFreeAccess(id, freeAccess);
  bustAulasCache();
}

export async function deleteModuleAction(id: string) {
  await requireAdmin();
  await deleteModule(id);
  bustAulasCache();
}

export async function createLessonAction(formData: FormData) {
  await requireAdmin();
  const raw = {
    moduleId: String(formData.get("moduleId") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    pandaVideoExternalId: String(formData.get("pandaVideoExternalId") ?? ""),
    pandaLibraryId: String(formData.get("pandaVideoExternalId") ?? "").trim()
      ? String(formData.get("pandaLibraryId") ?? "")
      : "",
    thumbnailUrl: String(formData.get("thumbnailUrl") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: formData.get("published") === "on",
  };
  lessonSchema.parse(raw);
  await createLesson(raw);
  bustAulasCache();
}

export async function updateLessonDescriptionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("lessonId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  if (!id) throw new Error("Aula inválida.");
  if (description.length > 12000) throw new Error("Descrição muito longa.");
  await prisma.lesson.update({
    where: { id },
    data: { description: description || null },
  });
  bustAulasCache();
}

export async function updateLessonAction(id: string, formData: FormData) {
  await requireAdmin();
  const raw = {
    moduleId: String(formData.get("moduleId") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    pandaVideoExternalId: String(formData.get("pandaVideoExternalId") ?? ""),
    pandaLibraryId: String(formData.get("pandaVideoExternalId") ?? "").trim()
      ? String(formData.get("pandaLibraryId") ?? "")
      : "",
    thumbnailUrl: String(formData.get("thumbnailUrl") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: formData.get("published") === "on",
  };
  lessonSchema.parse(raw);
  await updateLesson(id, raw);
  bustAulasCache();
}

export async function deleteLessonAction(id: string) {
  await requireAdmin();
  await deleteLesson(id);
  bustAulasCache();
}

export async function moveModuleAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const direction = formData.get("direction") === "up" ? "up" : "down";
  if (!id) throw new Error("Módulo não encontrado.");
  await moveModule(id, direction);
  bustAulasCache();
}

export async function moveLessonAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const direction = formData.get("direction") === "up" ? "up" : "down";
  if (!id) throw new Error("Aula não encontrada.");
  await moveLesson(id, direction);
  bustAulasCache();
}

export async function grantDeniedLoginEmailAction(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "");
  await addAllowedEmail({
    email,
    source: "login-attempt",
    note: "liberado pela aba Tentativas (F054)",
  });
  await markDeniedLoginsResolved(email);
  revalidatePath("/admin");
}

export async function resolveDeniedLoginAction(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "");
  await markDeniedLoginsResolved(email);
  revalidatePath("/admin");
}

/** F078 — regra padrão da live + exceção pontual (nextOverrideAt). */
export async function updateLiveScheduleAction(formData: FormData) {
  await requireAdmin();

  const weekday = Number(formData.get("weekday") ?? 2);
  const hour = Number(formData.get("hour") ?? 20);
  const minute = Number(formData.get("minute") ?? 0);
  if (weekday < 0 || weekday > 6) throw new Error("Dia da semana inválido.");
  if (hour < 0 || hour > 23) throw new Error("Hora inválida.");
  if (minute < 0 || minute > 59) throw new Error("Minuto inválido.");

  // <input type="datetime-local"> não carrega timezone — o admin digita em
  // horário de Brasília, então fixamos o offset -03:00 na hora de converter
  // (mesmo racional do BRT_OFFSET_MS em lib/live/regras.ts).
  const overrideRaw = String(formData.get("nextOverrideAt") ?? "").trim();
  let nextOverrideAt: Date | null = null;
  if (overrideRaw) {
    nextOverrideAt = new Date(`${overrideRaw}:00-03:00`);
    if (Number.isNaN(nextOverrideAt.getTime())) {
      throw new Error("Data/hora da exceção inválida.");
    }
    if (nextOverrideAt.getTime() <= Date.now()) {
      throw new Error("A exceção precisa estar no futuro.");
    }
  }

  const zoomUrlRaw = String(formData.get("zoomUrl") ?? "").trim();
  let zoomUrl: string | null = null;
  if (zoomUrlRaw) {
    if (!/^https:\/\//.test(zoomUrlRaw)) {
      throw new Error("Link do Zoom precisa começar com https://.");
    }
    zoomUrl = zoomUrlRaw;
  }

  await atualizarLiveSchedule({ weekday, hour, minute, nextOverrideAt, zoomUrl });
  revalidatePath("/admin");
  revalidatePath("/");
}
