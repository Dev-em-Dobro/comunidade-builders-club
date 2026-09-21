import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { dispararRegua, isTriggerRegua } from "@/lib/regua";

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

/** F075 / F084 — Vercel Cron (prod). Preview não dispara; QA com curl + CRON_SECRET. */
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

  const url = new URL(request.url);
  const email = url.searchParams.get("email")?.trim() || undefined;
  const triggerRaw = url.searchParams.get("trigger")?.trim();
  if (triggerRaw && !isTriggerRegua(triggerRaw)) {
    return NextResponse.json(
      { ok: false, erro: "trigger inválido." },
      { status: 400 },
    );
  }

  const resultado = await dispararRegua({
    onlyEmail: email,
    onlyTrigger: triggerRaw && isTriggerRegua(triggerRaw) ? triggerRaw : undefined,
  });
  return NextResponse.json({ ok: true, ...resultado });
}
