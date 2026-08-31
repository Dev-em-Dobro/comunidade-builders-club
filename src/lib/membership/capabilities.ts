// F041 / F053 — capabilities freemium (free | pro | elite).

import type { Membership, MembershipTier } from "@prisma/client";
import { AULA_THREADS_SPACE_SLUG } from "@/lib/spaces/constants";
import { PROMESSA_PRIMEIRO_CLIENTE } from "@/lib/membership/checkout";

/**
 * Spaces cuja *página* é liberada para free (sidebar sem cadeado).
 *
 * F063 — abertos quase todos: o free publica só em `projetos` (F065);
 * nos outros spaces a leitura aberta é vitrine. `freelas` fica de fora
 * porque indicação de freela é troca entre membros pagantes;
 * `aula-threads` é conteúdo de aula.
 */
export const FREE_SPACE_SLUGS = [
  "boas-vindas",
  "avisos",
  "presentes",
  "geral",
  "duvidas",
  "conquistas",
  "projetos",
] as const;

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
  if (pathname.startsWith("/planos")) return true;
  if (pathname.startsWith("/posts/")) return true; // detalhe: gate por space do post
  if (pathname.startsWith("/aulas")) return true;
  if (pathname.startsWith("/nova")) return true;
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
  /** F069 — origem: faixa da tela de Boas-vindas. Nunca abre modal. */
  | "boas-vindas"
  | "geral";

const UPGRADE_REASONS: readonly UpgradeReason[] = [
  "space",
  "materiais",
  "aulas",
  "busca",
  "publicar",
  "comentar",
  "reagir",
  "orion",
  "boas-vindas",
  "geral",
];

export function parseUpgradeReason(value: string | undefined): UpgradeReason | undefined {
  if (!value) return undefined;
  return (UPGRADE_REASONS as readonly string[]).includes(value)
    ? (value as UpgradeReason)
    : undefined;
}

export const UPGRADE_REASON_COPY: Record<
  UpgradeReason,
  { title: string; body: string }
> = {
  /**
   * F067 — copy pelo ganho. Free é um tier, não a ausência de um: nenhum
   * título usa "para membros" para separar free de pago. O separador é o
   * nome do plano.
   */
  space: {
    title: "Este space entra no PRO",
    body: "É onde os builders trocam indicação de freela e bastidor de atendimento. PRO e Elite abrem todos os spaces da comunidade.",
  },
  materiais: {
    title: "Skills e templates prontos",
    body: "Prompts, contratos, propostas e kits de entrega para usar já no próximo cliente. Liberados no PRO; o Elite soma a biblioteca ampliada.",
  },
  aulas: {
    title: "Continue a formação",
    body: "Você já tem o Comece por aqui. O PRO abre nicho, prospecção, abordagem e fechamento — o caminho inteiro até o primeiro cliente.",
  },
  busca: {
    title: "Ache quem já resolveu isso",
    body: "A busca varre posts e membros para você chegar direto em quem passou pelo mesmo problema. Entra no PRO.",
  },
  publicar: {
    title: "Publique na comunidade inteira",
    body: "No gratuito você posta no Desafio Projetos. PRO e Elite abrem os outros spaces para mostrar trabalho, pedir ajuda e aparecer para quem contrata.",
  },
  comentar: {
    title: "Entre na conversa",
    body: "Comentar e responder é como você aparece para quem já está fechando cliente. Liberado no PRO e no Elite.",
  },
  reagir: {
    title: "Reagir entra no PRO",
    body: "Reações vêm junto com comentar e publicar na comunidade inteira, no PRO e no Elite.",
  },
  orion: {
    title: "Orion entra no PRO",
    body: "O motor de prospecção para achar e priorizar cliente local. O PRO libera no teto Free; o Elite roda com limites de Pro por 90 dias.",
  },
  /**
   * F069 — continuidade da faixa de Boas-vindas: quem clicou lá cai numa
   * página que continua a frase, não numa genérica.
   *
   * A `/planos` usa só o `body`; o `title` existe porque o tipo pede e
   * fica sem uso aqui — este motivo nunca abre modal (a faixa é link).
   */
  "boas-vindas": {
    title: "Do primeiro dia ao primeiro cliente",
    body: "Você já tem o Comece por aqui, o feed e os presentes. PRO e Elite abrem a formação até o fechamento, as skills, os templates e a comunidade inteira.",
  },
  geral: {
    title: PROMESSA_PRIMEIRO_CLIENTE,
    body: "Dois planos, o mesmo objetivo. Formação completa, skills, templates e a comunidade que já está fechando cliente.",
  },
};

export function hrefPlanos(opts?: {
  motivo?: UpgradeReason;
  destaque?: "elite";
}): string {
  const p = new URLSearchParams();
  if (opts?.motivo && opts.motivo !== "geral") p.set("motivo", opts.motivo);
  if (opts?.destaque === "elite") p.set("destaque", "elite");
  const q = p.toString();
  return q ? `/planos?${q}` : "/planos";
}
