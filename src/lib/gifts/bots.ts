/**
 * F059 — filtro de crawler no GET do presente.
 *
 * Não descartar todo UA com "Instagram": o webview humano também contém.
 * Crawler de unfurl (facebookexternalhit / Instagram sem Mozilla) não é clique.
 */
const CRAWLER_RE =
  /facebookexternalhit|facebot|meta-externalagent|instagrambot|whatsapp|telegrambot|twitterbot|linkedinbot|slackbot|discordbot|iframely|embedly|preview|bot\b|crawler|spider|http\.rb/i;

export function isGiftCrawler(userAgent: string | null | undefined): boolean {
  const ua = userAgent?.trim() ?? "";
  if (!ua) return true;
  if (CRAWLER_RE.test(ua)) return true;
  if (/\binstagram\b/i.test(ua) && !/mozilla/i.test(ua)) return true;
  return false;
}
