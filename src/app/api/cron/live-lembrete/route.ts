import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { dispararLembretesLive } from "@/lib/live";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function cronAutorizado(request: Request): boolean {
  const esperado = process.env.CRON_SECRET?.trim();
  if (!esperado) return false;
  const recebido = request.headers.get("authorization") ?? "";
  const prefixo = "Bearer ";
  if (!recebido.startsWith(prefixo)) return false;
  const a = Buffer.from(recebido.slice(prefixo.length));
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * F079 — véspera + pouco antes da live. Mesmo padrão de auth do F075
 * (`/api/cron/regua`). Granularidade do agendamento (véspera cobre bem com
 * 1x/dia; pouco-antes precisa de disparo mais frequente) é decisão de
 * infra, documentada na spec — a rota já aceita ser chamada com qualquer
 * frequência sem duplicar envio (dedupe por ocorrência).
 */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      { ok: false, erro: "CRON_SECRET não configurado" },
      { status: 503 },
    );
  }
  if (!cronAutorizado(request)) {
    return NextResponse.json({ ok: false, erro: "Não autorizado." }, { status: 401 });
  }

  const resultado = await dispararLembretesLive();
  return NextResponse.json({ ok: true, ...resultado });
}
