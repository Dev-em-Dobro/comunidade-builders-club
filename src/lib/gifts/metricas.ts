import type { MembershipTier, Role, MembershipStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

const PAID_TIERS = new Set<MembershipTier>(["paid", "pro", "elite"]);

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
  visitas: number;
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
        visitas: 0,
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
    if (r) r.visitas += g._count._all;
  }

  for (const g of visitsGiftOnly) {
    const r = row(null, g.giftSlug);
    if (r) r.visitas += g._count._all;
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
      b.visitas - a.visitas ||
      a.label.localeCompare(b.label),
  );
}
