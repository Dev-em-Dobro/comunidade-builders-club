import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listSpaces } from "@/lib/spaces";
import { googleCalendarUrl, obterRegraLiveSchedule, proximaLive } from "@/lib/live";
import { NOME_PRODUTO } from "@/lib/produto";

/** Nav leve para hidratar a sidebar sem bloquear o SSR do feed. */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const [spaces, liveRegra] = await Promise.all([
    listSpaces(),
    obterRegraLiveSchedule(),
  ]);
  const liveAt = proximaLive(liveRegra, new Date());

  const clubUrl = process.env.BETTER_AUTH_URL?.trim()?.replace(/\/$/, "") ?? "";
  /** F079 — local do evento é o Zoom quando configurado, senão cai pro Club. */
  const localEvento = liveRegra.zoomUrl?.trim() || clubUrl || undefined;
  const live = {
    liveAt: liveAt.toISOString(),
    calendarUrl: googleCalendarUrl({
      liveAt,
      titulo: `Live semanal — ${NOME_PRODUTO}`,
      detalhes: localEvento,
      local: localEvento,
    }),
  };

  return NextResponse.json({
    spaces: spaces.map((s) => ({ id: s.id, slug: s.slug, name: s.name })),
    live,
  });
}
