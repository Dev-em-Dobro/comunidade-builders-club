// F041 — capabilities freemium.

import type { Membership, MembershipTier, Role } from "@prisma/client";

/** Spaces liberados para leitura free. */
export const FREE_SPACE_SLUGS = [
  "boas-vindas",
  "geral",
  "avisos",
] as const;

export type FreeSpaceSlug = (typeof FREE_SPACE_SLUGS)[number];

export function isFreeSpaceSlug(slug: string): boolean {
  return (FREE_SPACE_SLUGS as readonly string[]).includes(slug);
}

export function isPaidMembership(
  m: Pick<Membership, "tier" | "role" | "status">,
): boolean {
  if (m.status !== "active") return false;
  if (m.role === "admin" || m.role === "instructor") return true;
  return m.tier === "paid";
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
  return tier === "paid" ? "Pago" : "Gratuito";
}

export type UpgradeReason =
  | "space"
  | "materiais"
  | "aulas"
  | "busca"
  | "publicar"
  | "comentar"
  | "reagir"
  | "geral";
