import { NextResponse } from "next/server";
import { optOutReguaEmailByToken } from "@/lib/regua";

/** F075 — one-click List-Unsubscribe (RFC 8058). */
export async function POST(request: Request) {
  const t = new URL(request.url).searchParams.get("t") ?? "";
  const result = await optOutReguaEmailByToken(t);
  if (result !== "ok") {
    return new NextResponse(null, { status: 400 });
  }
  return new NextResponse(null, { status: 200 });
}

export async function GET(request: Request) {
  const t = new URL(request.url).searchParams.get("t") ?? "";
  const dest = t
    ? `/email/regua?t=${encodeURIComponent(t)}`
    : "/email/regua";
  return NextResponse.redirect(new URL(dest, request.url), 302);
}
