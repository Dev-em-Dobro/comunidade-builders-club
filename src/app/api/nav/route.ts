import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listSpaces } from "@/lib/spaces";

/**
 * Nav leve para hidratar a sidebar sem bloquear o SSR do feed.
 *
 * F102 — esta rota deixou de devolver `live`. A faixa da live semanal saiu do
 * topo do Club, e sem ela o payload só entregaria ao browser o `calendarUrl`,
 * que carrega o `zoomUrl` no local do evento, sem ninguém consumir. O lembrete
 * da live continua indo por e-mail, pelo cron (`src/lib/live/lembrete.ts`).
 */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const spaces = await listSpaces();

  return NextResponse.json({
    spaces: spaces.map((s) => ({ id: s.id, slug: s.slug, name: s.name })),
  });
}
