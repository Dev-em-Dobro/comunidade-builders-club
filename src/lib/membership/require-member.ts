import type { Membership, Profile, Role } from "@prisma/client";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/auth";
import { requireUser } from "@/lib/auth/require-user";
import { AuthError, ForbiddenError } from "@/lib/auth/errors";
import { ensureMemberBootstrap } from "./bootstrap";
import { contextoAceiteDeHeaders, type ContextoAceite } from "./aceite-legal";
import {
  hrefPlanos,
  isEliteMembership,
  isPaidMembership,
  isRestritoMembership,
} from "./capabilities";
import { UPGRADE_REQUIRED } from "./errors";
import { entradaContaRestrita } from "./restrito";

export type ActiveMember = {
  user: AuthUser;
  profile: Profile;
  membership: Membership;
};

/**
 * F058 — origem do aceite. Só é lido aqui porque `bootstrap` fica em `src/lib`
 * sem depender de Next; os headers já estão no request por causa da sessão.
 */
async function contextoAceite(): Promise<ContextoAceite> {
  return contextoAceiteDeHeaders(await headers());
}

export { UPGRADE_REQUIRED } from "./errors";

/** Sessão + membership active (free ou paid). Deduplica no request. */
export const requireActiveMember = cache(async (): Promise<ActiveMember> => {
  const user = await requireUser();
  const boot = await ensureMemberBootstrap(
    user.id,
    user.name,
    user.image,
    user.email,
    await contextoAceite(),
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

/**
 * F128 — ação do servidor aberta ao gratuito, mas fechada para conta restrita
 * (publicar, comentar, menções, notificações).
 */
export async function requireMemberSemRestricao(): Promise<ActiveMember> {
  const member = await requireActiveMember();
  if (isRestritoMembership(member.membership)) {
    throw new ForbiddenError(UPGRADE_REQUIRED);
  }
  return member;
}

/**
 * Sem sessão → /login. Membership pending/revoked → /aguardando.
 *
 * F128 — conta restrita é **negada por padrão** e vai para a entrada dela (o
 * módulo comprado). Só as páginas que ela pode abrir passam `restritoOk`.
 * Página nova nasce fechada.
 */
export async function requireActiveMemberOrRedirect(
  opts: { restritoOk?: boolean } = {},
): Promise<ActiveMember> {
  let member: ActiveMember;
  try {
    member = await requireActiveMember();
  } catch (e) {
    if (e instanceof AuthError) redirect("/login");
    if (e instanceof ForbiddenError) redirect("/aguardando");
    throw e;
  }
  if (!opts.restritoOk && isRestritoMembership(member.membership)) {
    redirect(await entradaContaRestrita(member.user.email));
  }
  return member;
}

export async function requirePaidMemberOrRedirect(
  upgradePath = hrefPlanos(),
): Promise<ActiveMember> {
  const member = await requireActiveMemberOrRedirect();
  if (!isPaidMembership(member.membership)) {
    redirect(upgradePath);
  }
  return member;
}

/** F097 — exige Elite (ou staff). Sem Elite → upgrade com destaque Elite. */
export async function requireEliteMemberOrRedirect(
  upgradePath = hrefPlanos({ motivo: "materiais-elite", destaque: "elite" }),
): Promise<ActiveMember> {
  const member = await requirePaidMemberOrRedirect(upgradePath);
  if (!isEliteMembership(member.membership)) {
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
