import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return (
    pathname.startsWith("/spaces") ||
    pathname.startsWith("/posts") ||
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/busca") ||
    pathname.startsWith("/notificacoes") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/aguardando")
  );
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
    const callback =
      pathname + (request.nextUrl.search ? request.nextUrl.search : "");
    if (callback !== "/") {
      loginUrl.searchParams.set("callbackUrl", callback);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/spaces/:path*",
    "/posts/:path*",
    "/perfil/:path*",
    "/busca",
    "/notificacoes",
    "/admin/:path*",
    "/aguardando",
    "/login",
  ],
};
