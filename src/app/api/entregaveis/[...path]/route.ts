// F019 — serve entregáveis para membership active.

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  lerArquivoEntregavel,
  sanitizarCorpoEntregavel,
} from "@/lib/entregaveis/servir";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ path: string[] }> };

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

  const { path } = await params;
  const arquivo = await lerArquivoEntregavel(path);
  if (!arquivo) {
    return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  }

  const corpo = sanitizarCorpoEntregavel(arquivo.body, arquivo.contentType);
  const ct = arquivo.contentType;
  const headersOut: Record<string, string> = {
    "Content-Type": ct,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };

  // Alinhado ao Orion: sem CSP sandbox opaca — assets/JS no iframe
  // (allow-same-origin) precisam da sessão/cookie para fetch relativo.
  if (ct.includes("svg")) {
    headersOut["Content-Disposition"] = "attachment";
  }

  return new NextResponse(new Uint8Array(corpo), {
    status: 200,
    headers: headersOut,
  });
}
