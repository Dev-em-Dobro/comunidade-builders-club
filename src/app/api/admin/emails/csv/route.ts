// F085 — CSV das métricas Resend (mesmos filtros da aba Admin).

import { NextRequest, NextResponse } from "next/server";
import { AuthError, ForbiddenError } from "@/lib/auth/errors";
import {
  isEmailCategoria,
  type EmailCategoria,
} from "@/lib/email/categorias";
import { csvMetricasEmail } from "@/lib/email/metricas-resend";
import { requireAdmin } from "@/lib/membership/require-member";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, erro: "Não autenticado" }, { status: 401 });
    }
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, erro: "Apenas admin" }, { status: 403 });
    }
    throw e;
  }

  const sp = request.nextUrl.searchParams;
  const diasRaw = Number(sp.get("dias") ?? "15");
  const dias = diasRaw === 7 || diasRaw === 15 || diasRaw === 30 ? diasRaw : 15;
  const emailStatus = sp.get("emailStatus") ?? "all";
  const status =
    ["delivered", "opened", "clicked", "bounced", "failed", "sent"].includes(
      emailStatus,
    )
      ? emailStatus
      : "all";
  const catRaw = sp.get("categoria") ?? "all";
  const categoria: EmailCategoria | "all" =
    catRaw !== "all" && isEmailCategoria(catRaw) ? catRaw : "all";

  try {
    const result = await csvMetricasEmail({ dias, status, categoria });
    if ("erro" in result) {
      return NextResponse.json({ ok: false, erro: result.erro }, { status: 503 });
    }
    return new NextResponse(result.csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao gerar CSV";
    return NextResponse.json({ ok: false, erro: msg }, { status: 502 });
  }
}
