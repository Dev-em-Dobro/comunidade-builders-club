/** F059 — cookie first-touch de atribuição. Sem Prisma: também roda no middleware. */

export const ORIGEM_COOKIE = "bc_origem";
export const ORIGEM_MAX_AGE_SEC = 90 * 24 * 60 * 60;

export type OrigemPayload = {
  utmContent: string;
  giftSlug: string;
};

const UTM_OK = /^[a-zA-Z0-9._-]{1,80}$/;
const SLUG_OK = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function sanitizeUtmValue(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const v = raw.trim().slice(0, 80);
  if (!v || !UTM_OK.test(v)) return null;
  return v;
}

export function sanitizeGiftSlug(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase().slice(0, 80);
  if (!v || !SLUG_OK.test(v)) return null;
  return v;
}

export function encodeOrigemCookie(payload: OrigemPayload): string {
  return `${payload.utmContent}|${payload.giftSlug}`;
}

export function parseOrigemCookie(raw: string | undefined): OrigemPayload | null {
  if (!raw) return null;
  try {
    const decoded = raw.includes("%") ? decodeURIComponent(raw) : raw;
    if (decoded.startsWith("{")) {
      const parsed = JSON.parse(decoded) as { utmContent?: unknown; giftSlug?: unknown };
      const utmContent = sanitizeUtmValue(parsed.utmContent as string);
      const giftSlug = sanitizeGiftSlug(parsed.giftSlug as string);
      if (!utmContent || !giftSlug) return null;
      return { utmContent, giftSlug };
    }
    const sep = decoded.indexOf("|");
    if (sep <= 0) return null;
    const utmContent = sanitizeUtmValue(decoded.slice(0, sep));
    const giftSlug = sanitizeGiftSlug(decoded.slice(sep + 1));
    if (!utmContent || !giftSlug) return null;
    return { utmContent, giftSlug };
  } catch {
    return null;
  }
}

export function origemCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: ORIGEM_MAX_AGE_SEC,
    secure,
  };
}
