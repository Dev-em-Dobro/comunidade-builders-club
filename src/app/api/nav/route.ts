import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listSpaces } from "@/lib/spaces";

/** Nav leve para hidratar a sidebar sem bloquear o SSR do feed. */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const spaces = await listSpaces();
  return NextResponse.json({
    spaces: spaces.map((s) => ({ id: s.id, slug: s.slug, name: s.name })),
  });
}
