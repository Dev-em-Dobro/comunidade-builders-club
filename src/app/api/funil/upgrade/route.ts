import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseUpgradeFunnelEvent } from "@/lib/membership/upgrade-funnel";

/** F109 — registra somente membros logados; a página de planos segue pública. */
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return new Response(null, { status: 204 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const event = parseUpgradeFunnelEvent(body);
  if (!event) {
    return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  }

  const membership = await prisma.membership.findUnique({
    where: { userId: session.user.id },
    select: { tier: true, status: true, role: true },
  });
  if (!membership) return new Response(null, { status: 204 });

  await prisma.upgradeFunnelEvent.create({
    data: {
      userId: session.user.id,
      ...event,
      membershipTier: membership.tier,
      membershipStatus: membership.status,
      membershipRole: membership.role,
    },
  });

  return NextResponse.json({ ok: true });
}
