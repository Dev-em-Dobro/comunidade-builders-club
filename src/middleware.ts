import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { safeCallbackPath } from "@/lib/security/urls";
import {
  encodeOrigemCookie,
  ORIGEM_COOKIE,
  origemCookieOptions,
  sanitizeGiftSlug,
  sanitizeUtmValue,
  CADASTRO_LANDING_SLUG,
} from "@/lib/gifts/origem";

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/presentes")) return false;
  if (pathname.startsWith("/cadastro")) return false;
  return (
    pathname.startsWith("/spaces") ||
    pathname.startsWith("/posts") ||
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/configuracoes") ||
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
  if (request.cookies.get(ORIGEM_COOKIE)) return response;

  const segments = pathname.split("/").filter(Boolean);
  let giftSlug: string | null = null;
  let utmContent: string | null = null;

  if (segments[0] === "cadastro") {
    // F066 — /cadastro genérico não tem origem; só /cadastro/[utm] (ou ?utm_content=).
    utmContent =
      sanitizeUtmValue(request.nextUrl.searchParams.get("utm_content")) ??
      sanitizeUtmValue(segments[1] ?? "");
    if (!utmContent) return response;
    giftSlug = CADASTRO_LANDING_SLUG;
  } else if (segments[0] === "presentes") {
    giftSlug = sanitizeGiftSlug(segments[1] ?? "");
    utmContent =
      sanitizeUtmValue(request.nextUrl.searchParams.get("utm_content")) ??
      sanitizeUtmValue(segments[2] ?? "");
  } else {
    return response;
  }

  if (!giftSlug) return response;

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
    "/cadastro",
    "/cadastro/:path*",
  ],
};
