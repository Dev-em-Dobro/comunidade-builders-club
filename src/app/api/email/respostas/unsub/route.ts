import { NextResponse } from "next/server";
import { optOutRepliesEmailByToken } from "@/lib/notifications/enviar-resposta";

/** F073 — one-click List-Unsubscribe (RFC 8058). */
export async function POST(request: Request) {
  const t = new URL(request.url).searchParams.get("t") ?? "";
  const result = await optOutRepliesEmailByToken(t);
  if (result !== "ok") {
    return new NextResponse(null, { status: 400 });
  }
  return new NextResponse(null, { status: 200 });
}

export async function GET(request: Request) {
  const t = new URL(request.url).searchParams.get("t") ?? "";
  const dest = t
    ? `/email/respostas?t=${encodeURIComponent(t)}`
    : "/email/respostas";
  return NextResponse.redirect(new URL(dest, request.url), 302);
}
