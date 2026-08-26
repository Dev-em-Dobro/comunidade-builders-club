/** F059 — cookie first-touch de atribuição. Sem Prisma: também roda no middleware. */

export const ORIGEM_COOKIE = "bc_origem";
export const ORIGEM_MAX_AGE_SEC = 90 * 24 * 60 * 60;

export type OrigemPayload = {
  utmContent: string | null;
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
  return `${payload.utmContent ?? ""}|${payload.giftSlug}`;
}

export function parseOrigemCookie(raw: string | undefined): OrigemPayload | null {
  if (!raw) return null;
  try {
    const decoded = raw.includes("%") ? decodeURIComponent(raw) : raw;
    if (decoded.startsWith("{")) {
      const parsed = JSON.parse(decoded) as { utmContent?: unknown; giftSlug?: unknown };
      const giftSlug = sanitizeGiftSlug(parsed.giftSlug as string);
      if (!giftSlug) return null;
      return {
        utmContent: sanitizeUtmValue(parsed.utmContent as string),
        giftSlug,
      };
    }
    const sep = decoded.indexOf("|");
    if (sep < 0) return null;
    const utmContent = sanitizeUtmValue(decoded.slice(0, sep));
    const giftSlug = sanitizeGiftSlug(decoded.slice(sep + 1));
    if (!giftSlug) return null;
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

/** UTMs fixas do funil Instagram → DM. */
export const GIFT_UTM_DEFAULTS = {
  source: "instagram",
  medium: "dm",
  campaign: "presentes",
} as const;

/** "Eu quero" → "eu-quero" */
export function slugifyPostName(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** `2026-09-22` (input type=date) → `22-09-2026` */
export function formatUtmDateBr(isoDate: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** `eu-quero` + `2026-09-22` → `eu-quero-22-09-2026` */
export function buildUtmContent(
  postName: string,
  isoDate: string,
): string | null {
  const name = slugifyPostName(postName);
  const date = formatUtmDateBr(isoDate);
  if (!name || !date) return null;
  return sanitizeUtmValue(`${name}-${date}`);
}

export function buildGiftSharePath(
  giftSlug: string,
  utmContent: string,
): string | null {
  const slug = sanitizeGiftSlug(giftSlug);
  const content = sanitizeUtmValue(utmContent);
  if (!slug || !content) return null;
  return `/presentes/${slug}/${content}`;
}

/** Landing da Jaque: só cadastro + origem, sem presente na plataforma. */
export const CADASTRO_LANDING_SLUG = "cadastro";

export function buildCadastroSharePath(utmContent: string): string | null {
  const content = sanitizeUtmValue(utmContent);
  if (!content) return null;
  return `/cadastro/${content}`;
}
