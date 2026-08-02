import { snippetFromBody } from "@/lib/markdown/text";

const TITLE_MAX = 90;

/** Remove marcação Markdown leve para título/snippet. */
export function stripMarkdownLite(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Título automático: 1ª linha / trecho do body. */
export function titleFromBody(body: string): string {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const first =
    lines.map((l) => stripMarkdownLite(l)).find((l) => l.length > 0) ??
    "Publicação";
  if (first.length <= TITLE_MAX) return first;
  return `${first.slice(0, TITLE_MAX - 1).trimEnd()}…`;
}

export function previewFromBody(body: string, max = 160): string {
  return snippetFromBody(stripMarkdownLite(body), max);
}
