// F014 / F021 / F053 — POST /api/webhooks/hubla (Hubla → AllowedEmail + membership).

import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { processarWebhookHubla } from "@/lib/hubla";
import { mapaProdutosHubla } from "@/lib/hubla/produtos";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function tokenEsperado(): string | null {
  return process.env.HUBLA_WEBHOOK_TOKEN?.trim() || null;
}

function tokenValido(recebido: string, esperado: string): boolean {
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const esperado = tokenEsperado();
  if (!esperado) {
    return NextResponse.json(
      { ok: false, erro: "HUBLA_WEBHOOK_TOKEN não configurado" },
      { status: 503 },
    );
  }

  const productPlanMap = mapaProdutosHubla();
  if (productPlanMap.size === 0) {
    return NextResponse.json(
      {
        ok: false,
        erro: "HUBLA_PRODUCT_ID / HUBLA_PRODUCT_ID_PRO / HUBLA_PRODUCT_ID_ELITE não configurado",
      },
      { status: 503 },
    );
  }

  const recebido = request.headers.get("x-hubla-token");
  if (!recebido || !tokenValido(recebido, esperado)) {
    return NextResponse.json({ ok: false, erro: "Não autorizado" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "JSON inválido" }, { status: 400 });
  }

  const eventType =
    typeof payload === "object" &&
    payload !== null &&
    "type" in payload &&
    typeof (payload as { type: unknown }).type === "string"
      ? (payload as { type: string }).type
      : "desconhecido";

  const idempotencyKey = request.headers.get("x-hubla-idempotency");

  try {
    const resultado = await processarWebhookHubla(payload, {
      productPlanMap,
      idempotencyKey,
      eventType,
    });

    return NextResponse.json({
      ok: true,
      ignorado: resultado.ignorado,
      ...(resultado.motivo ? { motivo: resultado.motivo } : {}),
    });
  } catch (e) {
    console.error("[hubla/webhook] falha ao processar", e);
    return NextResponse.json(
      { ok: false, erro: "Falha interna ao processar evento" },
      { status: 500 },
    );
  }
}
