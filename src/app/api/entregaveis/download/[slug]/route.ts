// F019 — download de kit .zip (portfolio, contrato, scripts).

import { NextRequest, NextResponse } from "next/server";
import {
  entregavelExigeElite,
  entregavelPorSlug,
} from "@/lib/entregaveis/catalogo";
import { montarKitZipPorSlug } from "@/lib/entregaveis/kit-zip";
import {
  membroEliteAtivo,
  membroPagoAtivo,
} from "@/lib/membership/api-gate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  if (!(await membroPagoAtivo())) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const { slug } = await params;
  const item = entregavelPorSlug(slug);
  if (item && entregavelExigeElite(item) && !(await membroEliteAtivo())) {
    return NextResponse.json(
      { erro: "Disponível no plano Elite" },
      { status: 403 },
    );
  }

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
