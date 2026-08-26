import { isSafeHttpUrl } from "@/lib/markdown/text";

const BARE_URL = /https?:\/\/[^\s<>"']+/i;
const NOTION_ID = /-?[0-9a-f]{32}$/i;

export function firstHttpUrl(text: string | null | undefined): string | null {
  if (!text) return null;
  const m = text.trim().match(BARE_URL);
  if (!m) return null;
  const raw = m[0].replace(/[),.;]+$/g, "");
  return isSafeHttpUrl(raw) ? raw : null;
}

export function looksLikeUrlTitle(text: string | null | undefined): boolean {
  if (!text) return false;
  const t = text.trim();
  return /^https?:\/\//i.test(t) || t.startsWith("www.");
}

/** Body que é só o link (com ou sem markdown). */
export function bodyIsOnlyUrl(body: string, href: string): boolean {
  const leftover = body
    .replace(href, "")
    .replace(/https?:\/\/[^\s<>"']+/gi, "")
    .replace(/\[.*?\]\([^)]*\)/g, "")
    .replace(/[#*_`[\]()]/g, "")
    .trim();
  return leftover.length === 0;
}

export function isNotionHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "notion.so" || host === "www.notion.so" || host.endsWith(".notion.site");
}

export function titleFromNotionUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!isNotionHost(u.hostname)) return null;
    const last = decodeURIComponent(
      u.pathname.split("/").filter(Boolean).pop() ?? "",
    );
    const withoutId = last.replace(NOTION_ID, "").replace(/-+$/g, "");
    if (!withoutId) return "Presente no Notion";
    const spaced = withoutId.replace(/-/g, " ").replace(/\s+/g, " ").trim();
    if (!spaced) return "Presente no Notion";
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  } catch {
    return null;
  }
}

export type GiftLinkView = {
  href: string;
  title: string;
  sourceLabel: string;
  showComposerTitle: boolean;
  showBody: boolean;
};

export function giftLinkView(gift: {
  title: string | null;
  body: string;
  linkUrl: string | null;
}): GiftLinkView | null {
  const href =
    firstHttpUrl(gift.linkUrl) ??
    firstHttpUrl(gift.body) ??
    firstHttpUrl(gift.title);
  if (!href) return null;

  let host = "";
  try {
    host = new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }

  const notionTitle = titleFromNotionUrl(href);
  const composerTitle = gift.title?.trim() || "";
  const showComposerTitle =
    Boolean(composerTitle) && !looksLikeUrlTitle(composerTitle);
  const title =
    (showComposerTitle ? composerTitle : null) ??
    notionTitle ??
    "Seu presente";

  return {
    href,
    title,
    sourceLabel: isNotionHost(host) ? "Notion" : host,
    showComposerTitle,
    showBody: !bodyIsOnlyUrl(gift.body, href),
  };
}

export function giftAdminLabel(gift: {
  slug: string;
  title: string | null;
  body: string;
  linkUrl: string | null;
}): string {
  const view = giftLinkView(gift);
  if (view) return view.title;
  if (gift.title && !looksLikeUrlTitle(gift.title)) return gift.title;
  return gift.slug;
}
