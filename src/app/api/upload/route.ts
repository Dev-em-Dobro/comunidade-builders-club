import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { storeUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const membership = await prisma.membership.findUnique({
    where: { userId: session.user.id },
  });
  if (!membership || membership.status !== "active") {
    return NextResponse.json({ error: "Sem acesso." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formulário inválido." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Arquivo obrigatório." }, { status: 400 });
  }

  try {
    const result = await storeUpload(file);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha no upload." },
      { status: 400 },
    );
  }
}
