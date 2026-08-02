// F019 — download de kit .zip (portfolio, contrato, scripts).

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { montarKitZipPorSlug } from "@/lib/entregaveis/kit-zip";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ slug: string }> };

async function membroAtivo(): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return false;
  const m = await prisma.membership.findUnique({
    where: { userId: session.user.id },
    select: { status: true },
  });
  return m?.status === "active";
}

export async function GET(_request: NextRequest, { params }: Params) {
  if (!(await membroAtivo())) {
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
