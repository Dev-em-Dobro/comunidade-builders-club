import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureMemberBootstrap } from "@/lib/membership/bootstrap";
import { listPosts } from "@/lib/posts";
import { listSpaces } from "@/lib/spaces";
import { countUnread } from "@/lib/notifications";

/**
 * Diagnóstico de latência do hot path (auth → membership → feed).
 * Protegido por sessão + PERF_DIAG_SECRET (header x-perf-secret) se definido.
 */
export async function GET() {
  const secret = process.env.PERF_DIAG_SECRET?.trim();
  const h = await headers();
  if (secret && h.get("x-perf-secret") !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const t0 = performance.now();
  const marks: Record<string, number | string | boolean | null> = {};

  const session = await auth.api.getSession({ headers: h });
  marks.sessionMs = Math.round(performance.now() - t0);
  if (!session?.user) {
    return NextResponse.json(
      { error: "Não autenticado", marks },
      { status: 401 },
    );
  }

  const t1 = performance.now();
  const boot = await ensureMemberBootstrap(
    session.user.id,
    session.user.name,
    session.user.image,
    session.user.email,
  );
  marks.bootstrapMs = Math.round(performance.now() - t1);

  const t2 = performance.now();
  const [spaces, unread, posts] = await Promise.all([
    listSpaces(),
    countUnread(session.user.id),
    listPosts({ viewerId: session.user.id, take: 30 }),
  ]);
  marks.parallelDataMs = Math.round(performance.now() - t2);
  marks.totalMs = Math.round(performance.now() - t0);
  marks.postsCount = posts.posts.length;
  marks.spacesCount = spaces.length;
  marks.unread = unread;
  marks.tier = boot?.membership.tier ?? null;
  marks.cookieCacheLikely = (marks.sessionMs as number) < 80;

  const res = NextResponse.json({ ok: true, marks });
  res.headers.set(
    "Server-Timing",
    [
      `session;dur=${marks.sessionMs}`,
      `bootstrap;dur=${marks.bootstrapMs}`,
      `data;dur=${marks.parallelDataMs}`,
      `total;dur=${marks.totalMs}`,
    ].join(", "),
  );
  return res;
}
