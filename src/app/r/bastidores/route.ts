import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BASTIDORES } from "@/lib/eventos/bastidores";

/**
 * Funil Presente → Bastidores: proxy que loga clique antes de redirecionar.
 *
 * - Exige sessão logada (a faixa só aparece para membros ativos).
 * - Grava evento com snapshot da origem do Membership (origin_gift_slug,
 *   origin_utm_content) para calcular a taxa Free-via-presente → grupo lives.
 * - Dedupe: no máximo 1 clique por usuário por dia calendário (unique clickedOn).
 * - Redireciona 302 para BASTIDORES.url (Sendflow).
 *
 * Usuários sem origem também são logados, mas não entram no denominador da meta.
 */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.redirect(BASTIDORES.url, 302);
  }

  const userId = session.user.id;

  const membership = await prisma.membership.findUnique({
    where: { userId },
    select: { originGiftSlug: true, originUtmContent: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.bastidoresCtaClick.upsert({
    where: { userId_clickedOn: { userId, clickedOn: today } },
    create: {
      userId,
      clickedOn: today,
      originGiftSlug: membership?.originGiftSlug ?? null,
      originUtmContent: membership?.originUtmContent ?? null,
    },
    update: {},
  });

  return NextResponse.redirect(BASTIDORES.url, 302);
}
