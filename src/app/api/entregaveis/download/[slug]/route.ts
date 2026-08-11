// F019 — download de kit .zip (portfolio, contrato, scripts).

import { NextRequest, NextResponse } from "next/server";
import { montarKitZipPorSlug } from "@/lib/entregaveis/kit-zip";
import { membroPagoAtivo } from "@/lib/membership/api-gate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  if (!(await membroPagoAtivo())) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const { slug } = await params;
  const kit = await montarKitZipPorSlug(slug);
  if (!kit) {
    return NextResponse.json({ erro: "Kit não encontrado" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(kit.body), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${kit.nomeArquivo}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
