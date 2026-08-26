import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { safeCallbackPath } from "@/lib/security/urls";
import {
  encodeOrigemCookie,
  ORIGEM_COOKIE,
  origemCookieOptions,
  sanitizeGiftSlug,
  sanitizeUtmValue,
} from "@/lib/gifts/origem";

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/presentes")) return false;
  return (
    pathname.startsWith("/spaces") ||
    pathname.startsWith("/posts") ||
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/busca") ||
    pathname.startsWith("/notificacoes") ||
    pathname.startsWith("/aulas") ||
    pathname.startsWith("/nova") ||
    pathname.startsWith("/entregaveis") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/aguardando")
  );
}

function applyOrigemCookie(request: NextRequest, response: NextResponse) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/presentes/")) return response;
  if (request.cookies.get(ORIGEM_COOKIE)) return response;

  const utmContent = sanitizeUtmValue(
    request.nextUrl.searchParams.get("utm_content"),
  );
  const giftSlug = sanitizeGiftSlug(pathname.split("/")[2] ?? "");
  if (!utmContent || !giftSlug) return response;

  response.cookies.set(
    ORIGEM_COOKIE,
    encodeOrigemCookie({ utmContent, giftSlug }),
    origemCookieOptions(request.nextUrl.protocol === "https:"),
  );
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  // Cookie stale (ex.: trocou DATABASE_URL) — a página /login valida a sessão de verdade.
  if (pathname === "/login") {
    return NextResponse.next();
  }

  if (isProtectedPath(pathname) && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    const callback = safeCallbackPath(
      pathname + (request.nextUrl.search ? request.nextUrl.search : ""),
    );
    if (callback !== "/") {
      loginUrl.searchParams.set("callbackUrl", callback);
    }
    return NextResponse.redirect(loginUrl);
  }

  return applyOrigemCookie(request, NextResponse.next());
}

export const config = {
  matcher: [
    "/",
    "/spaces/:path*",
    "/posts/:path*",
    "/perfil/:path*",
    "/busca",
    "/notificacoes",
    "/aulas",
    "/aulas/:path*",
    "/nova",
    "/entregaveis",
    "/entregaveis/:path*",
    "/admin/:path*",
    "/aguardando",
    "/login",
    "/presentes/:path*",
  ],
};
