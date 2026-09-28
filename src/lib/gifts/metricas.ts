import type { MembershipTier, Role, MembershipStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

const PAID_TIERS = new Set<MembershipTier>(["paid", "pro", "elite"]);

/** Meta de referência: ~40% dos Free-via-presente clicam no grupo das lives. */
export const META_FUNIL_BASTIDORES_PCT = 40;

export type UtmPostPerson = {
  email: string;
  displayName: string;
  tier: MembershipTier;
  role: Role;
  status: MembershipStatus;
  originAt: Date | null;
  assinouPlano: boolean;
};

export type UtmPostMetric = {
  key: string;
  label: string;
  /**
   * **Aberturas de página, não pessoas.** `recordGiftVisit` insere uma linha
   * por request: recarga, botão "voltar" e reabrir o link do DM contam de
   * novo. Não há identificador em `gift_visit` para agrupar, nem forma de
   * desinflar o histórico depois.
   *
   * Chamava-se `visitas` até 04/09/2026. Renomeado porque "visita", em
   * analytics, é lido como pessoa única — e a conversão calculada sobre esta
   * base sai menor do que a real. Contar pessoas exige identificador
   * pseudônimo no `gift_visit`, que é feature própria.
   */
  acessos: number;
  cadastros: number;
  assinaramPlano: number;
  pessoas: UtmPostPerson[];
};

/** F059 — pago agora (PRO/Elite/paid) + origem daquele post. Admin/instrutor não conta. */
function assinouPlanoVeioDaPostagem(p: {
  tier: MembershipTier;
  role: Role;
  status: MembershipStatus;
}): boolean {
  if (p.status !== "active") return false;
  if (p.role !== "member") return false;
  return PAID_TIERS.has(p.tier);
}

function metricKey(utmContent: string | null, giftSlug: string | null): string | null {
  if (utmContent) return `utm:${utmContent}`;
  if (giftSlug) return `gift:${giftSlug}`;
  return null;
}

function metricLabel(utmContent: string | null, giftSlug: string | null): string {
  if (utmContent) return utmContent;
  if (giftSlug) return `${giftSlug} · sem UTM de post`;
  return "sem origem";
}

export async function listUtmPostMetrics(): Promise<UtmPostMetric[]> {
  const [visitsWithUtm, visitsGiftOnly, memberships] = await Promise.all([
    prisma.giftVisit.groupBy({
      by: ["utmContent"],
      where: { utmContent: { not: null } },
      _count: { _all: true },
    }),
    prisma.giftVisit.groupBy({
      by: ["giftSlug"],
      where: { utmContent: null },
      _count: { _all: true },
    }),
    prisma.membership.findMany({
      where: {
        OR: [
          { originUtmContent: { not: null } },
          { originGiftSlug: { not: null } },
        ],
      },
      select: {
        originUtmContent: true,
        originGiftSlug: true,
        originAt: true,
        tier: true,
        role: true,
        status: true,
        user: {
          select: {
            email: true,
            profile: { select: { displayName: true } },
          },
        },
      },
      orderBy: { originAt: "desc" },
    }),
  ]);

  const byPost = new Map<string, UtmPostMetric>();

  function row(utmContent: string | null, giftSlug: string | null): UtmPostMetric | null {
    const key = metricKey(utmContent, giftSlug);
    if (!key) return null;
    let r = byPost.get(key);
    if (!r) {
      r = {
        key,
        label: metricLabel(utmContent, giftSlug),
        acessos: 0,
        cadastros: 0,
        assinaramPlano: 0,
        pessoas: [],
      };
      byPost.set(key, r);
    }
    return r;
  }

  for (const g of visitsWithUtm) {
    const r = row(g.utmContent, null);
    if (r) r.acessos += g._count._all;
  }

  for (const g of visitsGiftOnly) {
    const r = row(null, g.giftSlug);
    if (r) r.acessos += g._count._all;
  }

  for (const m of memberships) {
    const r = row(m.originUtmContent, m.originGiftSlug);
    if (!r) continue;
    const paid = assinouPlanoVeioDaPostagem(m);
    r.cadastros += 1;
    if (paid) r.assinaramPlano += 1;
    r.pessoas.push({
      email: m.user.email,
      displayName: m.user.profile?.displayName ?? m.user.email,
      tier: m.tier,
      role: m.role,
      status: m.status,
      originAt: m.originAt,
      assinouPlano: paid,
    });
  }

  return [...byPost.values()].sort(
    (a, b) =>
      b.cadastros - a.cadastros ||
      b.assinaramPlano - a.assinaramPlano ||
      b.acessos - a.acessos ||
      a.label.localeCompare(b.label),
  );
}

// ---------------------------------------------------------------------------
// Funil Presente → Bastidores (cliques no CTA "Entrar no grupo")
// ---------------------------------------------------------------------------

export type BastidoresOrigemMetric = {
  key: string;
  label: string;
  /** Cadastros Free com essa origem (denominador). */
  cadastrosFreeComOrigem: number;
  /** Cliques no CTA Bastidores com essa origem (numerador). */
  cliquesBastidores: number;
  /** Taxa cliques/cadastros em percentual (null se denominador = 0). */
  taxaPct: number | null;
};

export type BastidoresFunilSummary = {
  /** Total de Free com origem (qualquer post). */
  totalFreeComOrigem: number;
  /** Total de cliques Bastidores com origem. */
  totalCliquesComOrigem: number;
  /** Taxa geral cliques/cadastros em percentual. */
  taxaGeralPct: number | null;
  /** Meta de referência (30–50%, default 40%). */
  metaReferenciaPct: number;
  /** Breakdown por post de origem, ordenado por cadastros desc. */
  porOrigem: BastidoresOrigemMetric[];
};

function calcTaxa(numerador: number, denominador: number): number | null {
  if (denominador === 0) return null;
  return Math.round((numerador / denominador) * 1000) / 10;
}

/**
 * Métricas do funil Presente → Bastidores: taxa de cliques no CTA por origem.
 *
 * Denominador: Free cadastros com origem (Membership origin_*). NÃO usa acessos
 * do GiftVisit (que são aberturas de página, não pessoas).
 *
 * Numerador: usuários únicos que clicaram no CTA Bastidores (pessoas, não cliques —
 * o modelo dedupa por dia, mas aqui conta pessoa).
 */
export async function listBastidoresFunilMetrics(): Promise<BastidoresFunilSummary> {
  const [freeComOrigem, cliquesComOrigem] = await Promise.all([
    prisma.membership.findMany({
      where: {
        tier: "free",
        OR: [
          { originUtmContent: { not: null } },
          { originGiftSlug: { not: null } },
        ],
      },
      select: {
        userId: true,
        originUtmContent: true,
        originGiftSlug: true,
      },
    }),
    prisma.bastidoresCtaClick.findMany({
      where: {
        OR: [
          { originUtmContent: { not: null } },
          { originGiftSlug: { not: null } },
        ],
      },
      select: {
        userId: true,
        originUtmContent: true,
        originGiftSlug: true,
      },
      distinct: ["userId"],
    }),
  ]);

  const byKey = new Map<
    string,
    { cadastros: Set<string>; cliques: Set<string> }
  >();

  function keyOf(utm: string | null, slug: string | null): string | null {
    if (utm) return `utm:${utm}`;
    if (slug) return `gift:${slug}`;
    return null;
  }

  function bucket(k: string) {
    let b = byKey.get(k);
    if (!b) {
      b = { cadastros: new Set(), cliques: new Set() };
      byKey.set(k, b);
    }
    return b;
  }

  for (const m of freeComOrigem) {
    const k = keyOf(m.originUtmContent, m.originGiftSlug);
    if (k) bucket(k).cadastros.add(m.userId);
  }

  for (const c of cliquesComOrigem) {
    const k = keyOf(c.originUtmContent, c.originGiftSlug);
    if (k) bucket(k).cliques.add(c.userId);
  }

  const porOrigem: BastidoresOrigemMetric[] = [...byKey.entries()]
    .map(([key, { cadastros, cliques }]) => ({
      key,
      label: key.startsWith("utm:")
        ? key.slice(4)
        : key.startsWith("gift:")
          ? `${key.slice(5)} · sem UTM`
          : key,
      cadastrosFreeComOrigem: cadastros.size,
      cliquesBastidores: cliques.size,
      taxaPct: calcTaxa(cliques.size, cadastros.size),
    }))
    .sort((a, b) => b.cadastrosFreeComOrigem - a.cadastrosFreeComOrigem);

  const totalCadastros = new Set(freeComOrigem.map((m) => m.userId)).size;
  const totalCliques = new Set(cliquesComOrigem.map((c) => c.userId)).size;

  return {
    totalFreeComOrigem: totalCadastros,
    totalCliquesComOrigem: totalCliques,
    taxaGeralPct: calcTaxa(totalCliques, totalCadastros),
    metaReferenciaPct: META_FUNIL_BASTIDORES_PCT,
    porOrigem,
  };
}
