/** Escape HTML entities. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function snippetFromBody(body: string, max = 120): string {
  const flat = body.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max - 1)}…`;
}

export function isSafeHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * F076 — imagem em linha própria: `![legenda](url)`.
 *
 * Só a linha inteira conta: print e meme são bloco no meio do artigo, nunca no
 * meio de uma frase. A legenda vira `<figcaption>` e `alt` ao mesmo tempo, para
 * quem escreve não ter de lembrar de dois campos e quem usa leitor de tela
 * ouvir a mesma frase que está impressa embaixo da imagem. Legenda vazia
 * (`![](url)`) é permitida, para imagem decorativa.
 *
 * Mora aqui, e não no `index.tsx`, para poder ser testada sem renderizar React.
 */
const IMAGEM_BLOCO = /^!\[([^\]]*)\]\((\S+)\)$/;

export function parseImagemBloco(
  line: string,
): { legenda: string; url: string } | null {
  const m = line.trim().match(IMAGEM_BLOCO);
  if (!m) return null;
  const url = m[2]!;
  if (!isSafeHref(url)) return null;
  return { legenda: m[1]!.trim(), url };
}

/** http(s) ou caminho interno de download (`/materiais/foo.zip`). */
export function isSafeHref(href: string): boolean {
  const value = href.trim();
  if (isSafeHttpUrl(value)) return true;
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  if (value.includes("\\") || value.includes(":")) return false;
  return true;
}
