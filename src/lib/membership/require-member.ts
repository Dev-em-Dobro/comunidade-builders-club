import type { Membership, Profile, Role } from "@prisma/client";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/auth";
import { requireUser } from "@/lib/auth/require-user";
import { AuthError, ForbiddenError } from "@/lib/auth/errors";
import { ensureMemberBootstrap } from "./bootstrap";
import { isPaidMembership } from "./capabilities";
import { UPGRADE_REQUIRED } from "./errors";

export type ActiveMember = {
  user: AuthUser;
  profile: Profile;
  membership: Membership;
};

export { UPGRADE_REQUIRED } from "./errors";

/** Sessão + membership active (free ou paid). Deduplica no request. */
export const requireActiveMember = cache(async (): Promise<ActiveMember> => {
  const user = await requireUser();
  const boot = await ensureMemberBootstrap(
    user.id,
    user.name,
    user.image,
    user.email,
  );

  if (!boot?.membership || !boot.profile) {
    throw new AuthError("Perfil incompleto. Tente entrar novamente.");
  }

  const { membership, profile } = boot;

  if (membership.status !== "active") {
    throw new ForbiddenError(
      membership.status === "pending"
        ? "Sua conta aguarda ativação por um administrador."
        : "Seu acesso à comunidade foi revogado.",
    );
  }

  return { user, profile, membership };
});

/** Exige tier paid (ou staff). */
export async function requirePaidMember(): Promise<ActiveMember> {
  const member = await requireActiveMember();
  if (!isPaidMembership(member.membership)) {
    throw new ForbiddenError(UPGRADE_REQUIRED);
  }
  return member;
}

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

export async function requirePaidMemberOrRedirect(
  upgradePath = "/?upgrade=1",
): Promise<ActiveMember> {
  const member = await requireActiveMemberOrRedirect();
  if (!isPaidMembership(member.membership)) {
    redirect(upgradePath);
  }
  return member;
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
