import type { Membership, Profile, Role } from "@prisma/client";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { AuthUser } from "@/lib/auth";
import { requireUser } from "@/lib/auth/require-user";
import { AuthError, ForbiddenError } from "@/lib/auth/errors";
import { ensureMemberBootstrap } from "./bootstrap";

export type ActiveMember = {
  user: AuthUser;
  profile: Profile;
  membership: Membership;
};

/** Deduplica auth+membership no mesmo request (layout + page). */
export const requireActiveMember = cache(async (): Promise<ActiveMember> => {
  const user = await requireUser();
  await ensureMemberBootstrap(user.id, user.name, user.image);

  const [membership, profile] = await Promise.all([
    prisma.membership.findUnique({ where: { userId: user.id } }),
    prisma.profile.findUnique({ where: { userId: user.id } }),
  ]);

  if (!membership || !profile) {
    throw new AuthError("Perfil incompleto. Tente entrar novamente.");
  }

  if (membership.status !== "active") {
    throw new ForbiddenError(
      membership.status === "pending"
        ? "Sua conta aguarda ativação por um administrador."
        : "Seu acesso à comunidade foi revogado.",
    );
  }

  return { user, profile, membership };
});

export async function requireAdmin(): Promise<ActiveMember> {
  const member = await requireActiveMember();
  if (member.membership.role !== "admin") {
    throw new ForbiddenError("Apenas administradores.");
  }
  return member;
}

/** Sem sessão → /login. Membership pending/revoked → /aguardando. */
export async function requireActiveMemberOrRedirect(): Promise<ActiveMember> {
  try {
    return await requireActiveMember();
  } catch (e) {
    if (e instanceof AuthError) redirect("/login");
    if (e instanceof ForbiddenError) redirect("/aguardando");
    throw e;
  }
}

/** Sem sessão → /login. Sem papel admin → /. */
export async function requireAdminOrRedirect(): Promise<ActiveMember> {
  try {
    return await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) redirect("/login");
    if (e instanceof ForbiddenError) redirect("/");
    throw e;
  }
}

export function isStaff(role: Role): boolean {
  return role === "admin" || role === "instructor";
}
