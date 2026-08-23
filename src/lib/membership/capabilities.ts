// F041 / F053 — capabilities freemium (free | pro | elite).

import type { Membership, MembershipTier } from "@prisma/client";
import { AULA_THREADS_SPACE_SLUG } from "@/lib/spaces/constants";

/** Spaces cuja *página* é liberada para free (sidebar sem cadeado). */
export const FREE_SPACE_SLUGS = ["boas-vindas", "geral"] as const;

export type FreeSpaceSlug = (typeof FREE_SPACE_SLUGS)[number];

export function isFreeSpaceSlug(slug: string): boolean {
  return (FREE_SPACE_SLUGS as readonly string[]).includes(slug);
}

/**
 * F041 — o feed é vitrine: free abre e lê qualquer post que apareça nele.
 * Só as threads de aula ficam de fora (conteúdo pago, nunca vai ao feed).
 * Interagir (comentar, reagir) continua sendo PRO+ — gate é outro.
 */
export function canFreeReadPost(spaceSlug: string): boolean {
  return spaceSlug !== AULA_THREADS_SPACE_SLUG;
}

const PAID_TIERS = new Set<MembershipTier>(["paid", "pro", "elite"]);

export function isPaidMembership(
  m: Pick<Membership, "tier" | "role" | "status">,
): boolean {
  if (m.status !== "active") return false;
  if (m.role === "admin" || m.role === "instructor") return true;
  return PAID_TIERS.has(m.tier);
}

export function isEliteMembership(
  m: Pick<Membership, "tier" | "role" | "status">,
): boolean {
  if (m.status !== "active") return false;
  if (m.role === "admin" || m.role === "instructor") return true;
  return m.tier === "elite";
}

export function isFreeMembership(
  m: Pick<Membership, "tier" | "role" | "status">,
): boolean {
  return m.status === "active" && !isPaidMembership(m);
}

/** Rotas do app liberadas para free (além dos spaces free). */
export function isFreeAppPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "") return true;
  if (pathname.startsWith("/notificacoes")) return true;
  if (pathname.startsWith("/perfil")) return true;
  if (pathname.startsWith("/posts/")) return true; // detalhe: gate por space do post
  if (pathname.startsWith("/spaces/")) {
    const slug = pathname.split("/")[2] ?? "";
    return isFreeSpaceSlug(slug);
  }
  return false;
}

export function tierLabel(tier: MembershipTier): string {
  if (tier === "elite") return "Elite";
  if (tier === "pro" || tier === "paid") return "PRO";
  return "Gratuito";
}

export type UpgradeReason =
  | "space"
  | "materiais"
  | "aulas"
  | "busca"
  | "publicar"
  | "comentar"
  | "reagir"
  | "orion"
  | "geral";
