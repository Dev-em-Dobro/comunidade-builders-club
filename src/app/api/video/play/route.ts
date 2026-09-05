import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fonteValida, registrarPlay } from "@/lib/video/registro";

/**
 * F080 — POST /api/video/play
 *
 * Recebe "fulano está no minuto N deste vídeo". Chamado no play e a cada
 * intervalo enquanto o vídeo roda, incluindo no fechamento da aba via
 * `sendBeacon` — por isso precisa aceitar corpo de `text/plain`, que é o que o
 * beacon manda quando não se usa Blob com content-type.
 *
 * Anônimo não registra: sem sessão não há a quem atribuir a audiência, e o que
 * a casa quer saber é se o MEMBRO assiste. Responde 401 em silêncio, sem
 * quebrar a página de quem está deslogado.
 */
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    // sendBeacon com text/plain cai aqui: o corpo é JSON, o content-type não.
    try {
      corpo = JSON.parse(await request.text());
    } catch {
      return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
    }
  }

  const { fonte, videoId, lessonId, segundos } = (corpo ?? {}) as Record<string, unknown>;

  if (!fonteValida(fonte)) {
    return NextResponse.json({ error: "fonte inválida." }, { status: 400 });
  }
  if (typeof videoId !== "string" || !videoId.trim()) {
    return NextResponse.json({ error: "videoId obrigatório." }, { status: 400 });
  }

  const { segundos: gravado } = await registrarPlay({
    userId: session.user.id,
    fonte,
    videoId: videoId.trim(),
    lessonId: typeof lessonId === "string" && lessonId.trim() ? lessonId.trim() : null,
    segundos: typeof segundos === "number" ? segundos : Number(segundos ?? 0),
  });

  return NextResponse.json({ ok: true, segundos: gravado });
}
