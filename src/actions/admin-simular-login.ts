"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/membership/require-member";

/**
 * F123 — admin passa a navegar como o membro (Better Auth impersonate).
 */
export async function simularLoginAction(userId: string) {
  const admin = await requireAdmin();

  // Self-heal: admins pré-F123 podem ter Membership.admin sem User.role.
  if (admin.membership.role === "admin") {
    await prisma.user.update({
      where: { id: admin.user.id },
      data: { role: "admin" },
    });
  }

  const target = await prisma.membership.findUnique({
    where: { userId },
    select: { role: true, userId: true },
  });
  if (!target) {
    throw new Error("Membro não encontrado.");
  }
  if (target.role === "admin") {
    throw new Error("Não é possível simular o login de outro administrador.");
  }
  if (target.userId === admin.user.id) {
    throw new Error("Você já está logado nesta conta.");
  }

  const h = await headers();
  await auth.api.impersonateUser({
    body: { userId },
    headers: h,
  });

  console.info("[F123] simular-login", {
    adminId: admin.user.id,
    targetUserId: userId,
  });

  redirect("/perfil");
}

/** F123 — restaura a sessão do admin. */
export async function pararSimulacaoAction() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.session || !("impersonatedBy" in session.session) || !session.session.impersonatedBy) {
    redirect("/admin?tab=membros");
  }

  await auth.api.stopImpersonating({ headers: h });
  console.info("[F123] parar-simulacao", {
    wasUserId: session.user.id,
    adminId: session.session.impersonatedBy,
  });
  redirect("/admin?tab=membros");
}
