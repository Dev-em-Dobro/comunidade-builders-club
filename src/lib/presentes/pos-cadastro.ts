/**
 * F118 — destino do presente e lembrete pós-cadastro.
 *
 * Sem Prisma: o slug já veio da página pública (F059) ou do cookie de origem.
 * Sem Next. sessionStorage é o único estado; falha (Safari privado) = sem
 * lembrete, cadastro e atribuição seguem iguais.
 */
import {
  CADASTRO_LANDING_SLUG,
  sanitizeGiftSlug,
} from "@/lib/gifts/origem";

export const PRESENTE_ARTIGO_ID = "presente";

export const POS_CADASTRO_PENDING_KEY = "bc_pos_cadastro_presente";
export const POS_CADASTRO_SHOWN_KEY = "bc_pos_cadastro_presente_shown";

const TITLE_MAX = 120;

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type PosCadastroPresente = {
  slug: string;
  title: string | null;
  href: string;
};

export const POS_CADASTRO_POPUP = {
  agora: "Ver meu presente",
  depois: "Depois",
  fechar: "Fechar",
  corpo:
    "Você pediu esse presente no Instagram. Dá para abrir agora ou deixar para depois.",
} as const;

export function giftPublicPath(slug: string | null | undefined): string | null {
  const clean = sanitizeGiftSlug(slug);
  if (!clean || clean === CADASTRO_LANDING_SLUG) return null;
  return `/presentes/${clean}`;
}

export function tituloPosCadastro(title: string | null | undefined): string {
  const nome = title?.trim();
  if (!nome) return "Quer ver seu presente agora?";
  return `Quer ver “${nome}” agora?`;
}

function sanitizeTitle(raw: string | null | undefined): string | null {
  const t = raw?.trim().slice(0, TITLE_MAX) ?? "";
  return t.length > 0 ? t : null;
}

export function encodePosCadastroPresente(input: {
  slug: string;
  title?: string | null;
}): string | null {
  const href = giftPublicPath(input.slug);
  const slug = sanitizeGiftSlug(input.slug);
  if (!href || !slug) return null;
  return JSON.stringify({ slug, title: sanitizeTitle(input.title) });
}

export function parsePosCadastroPresente(
  raw: string | null | undefined,
): PosCadastroPresente | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { slug?: unknown; title?: unknown };
    const href = giftPublicPath(typeof parsed.slug === "string" ? parsed.slug : null);
    const slug = sanitizeGiftSlug(
      typeof parsed.slug === "string" ? parsed.slug : null,
    );
    if (!href || !slug) return null;
    const title =
      typeof parsed.title === "string" ? sanitizeTitle(parsed.title) : null;
    return { slug, title, href };
  } catch {
    return null;
  }
}

export function shouldShowPosCadastroPopup(opts: {
  pending: PosCadastroPresente | null;
  shownRaw: string | null | undefined;
}): boolean {
  return Boolean(opts.pending) && opts.shownRaw !== "1";
}

export function rememberPosCadastroPresente(
  storage: StorageLike,
  input: { slug: string; title?: string | null },
): boolean {
  const encoded = encodePosCadastroPresente(input);
  if (!encoded) return false;
  storage.setItem(POS_CADASTRO_PENDING_KEY, encoded);
  storage.removeItem(POS_CADASTRO_SHOWN_KEY);
  return true;
}

/**
 * Primeira leitura válida consome o pending e marca shown. Recarga ou
 * navegação seguinte não abre de novo (decisão 3).
 */
export function consumePosCadastroPresente(
  storage: StorageLike,
): PosCadastroPresente | null {
  const pending = parsePosCadastroPresente(
    storage.getItem(POS_CADASTRO_PENDING_KEY),
  );
  if (
    !shouldShowPosCadastroPopup({
      pending,
      shownRaw: storage.getItem(POS_CADASTRO_SHOWN_KEY),
    })
  ) {
    return null;
  }
  storage.setItem(POS_CADASTRO_SHOWN_KEY, "1");
  storage.removeItem(POS_CADASTRO_PENDING_KEY);
  return pending;
}

export function getBrowserSessionStorage(): StorageLike | null {
  try {
    const s = window.sessionStorage;
    const probe = "__bc_pos_cadastro_probe";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}
