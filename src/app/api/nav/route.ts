import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listSpaces } from "@/lib/spaces";
import { googleCalendarUrl, obterRegraLiveSchedule, proximaLive } from "@/lib/live";
import { isEliteMembership } from "@/lib/membership/capabilities";
import { NOME_PRODUTO } from "@/lib/produto";

/** Nav leve para hidratar a sidebar sem bloquear o SSR do feed. */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const [spaces, membership, liveRegra] = await Promise.all([
    listSpaces(),
    prisma.membership.findUnique({ where: { userId: session.user.id } }),
    obterRegraLiveSchedule(),
  ]);

  /**
   * F079 — a reunião semanal é benefício da oferta Elite: quem não é Elite
   * (nem staff) não recebe o horário nem o `calendarUrl`, que leva o `zoomUrl`
   * no local/detalhes do evento. Gate no servidor, não só no render: esta rota
   * é pública para logado.
   */
  const live =
    membership && isEliteMembership(membership) ? montarLive(liveRegra) : null;

  return NextResponse.json({
    spaces: spaces.map((s) => ({ id: s.id, slug: s.slug, name: s.name })),
    live,
  });
}

function montarLive(
  liveRegra: Awaited<ReturnType<typeof obterRegraLiveSchedule>>,
) {
  const liveAt = proximaLive(liveRegra, new Date());

  const clubUrl = process.env.BETTER_AUTH_URL?.trim()?.replace(/\/$/, "") ?? "";
  /** F079 — local do evento é o Zoom quando configurado, senão cai pro Club. */
  const localEvento = liveRegra.zoomUrl?.trim() || clubUrl || undefined;

  return {
    liveAt: liveAt.toISOString(),
    calendarUrl: googleCalendarUrl({
      liveAt,
      titulo: `Live semanal — ${NOME_PRODUTO}`,
      detalhes: localEvento,
      local: localEvento,
    }),
  };
}
