import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listSpaces } from "@/lib/spaces";
import { googleCalendarUrl, obterProximaLive } from "@/lib/live";
import { NOME_PRODUTO } from "@/lib/produto";

/** Nav leve para hidratar a sidebar sem bloquear o SSR do feed. */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const [spaces, liveAt] = await Promise.all([listSpaces(), obterProximaLive()]);

  const clubUrl = process.env.BETTER_AUTH_URL?.trim()?.replace(/\/$/, "") ?? "";
  /** F078 — mesma requisição já hidrata a faixa fixa da live. */
  const live = {
    liveAt: liveAt.toISOString(),
    calendarUrl: googleCalendarUrl({
      liveAt,
      titulo: `Live semanal — ${NOME_PRODUTO}`,
      detalhes: clubUrl || undefined,
      local: clubUrl || undefined,
    }),
  };

  return NextResponse.json({
    spaces: spaces.map((s) => ({ id: s.id, slug: s.slug, name: s.name })),
    live,
  });
}
