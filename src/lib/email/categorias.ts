/** F085 — categorias dos e-mails transacionais do Club. */

import { NOME_PRODUTO } from "@/lib/produto";

export const EMAIL_CATEGORIAS = [
  "login",
  "live",
  "regua",
  "respostas",
  "outro",
] as const;

export type EmailCategoria = (typeof EMAIL_CATEGORIAS)[number];

export const EMAIL_CATEGORIA_LABEL: Record<EmailCategoria, string> = {
  login: "Login",
  live: "Lives",
  regua: "Régua",
  respostas: "Respostas",
  outro: "Outros",
};

/** Tag Resend (só ASCII / underscore / hífen). */
export const RESEND_TAG_CATEGORY = "category";

const NOME_PRODUTO_LC = NOME_PRODUTO.toLowerCase();

export function isEmailCategoria(v: string): v is EmailCategoria {
  return (EMAIL_CATEGORIAS as readonly string[]).includes(v);
}

/**
 * Só entram métricas do Club — evita Orion, Scudo e outros apps na mesma
 * conta Resend. Marcadores: assunto ou From com "Builders Club".
 */
export function ehEmailBuildersClub(opts: {
  subject: string;
  from?: string | null;
}): boolean {
  const subject = opts.subject.toLowerCase();
  const from = (opts.from ?? "").toLowerCase();
  if (subject.includes(NOME_PRODUTO_LC)) return true;
  if (from.includes(NOME_PRODUTO_LC)) return true;
  return false;
}

/**
 * Classifica pelo assunto — só chamar depois de `ehEmailBuildersClub`.
 * Ordem: live → login → régua → respostas → outro.
 */
export function categorizarPorAssunto(subject: string): EmailCategoria {
  const s = subject.toLowerCase();

  // F079 — "Amanhã tem live no Builders Club" / "Começa em instantes: live no …"
  if (/\blive\b/.test(s) && s.includes(NOME_PRODUTO_LC)) return "live";

  // Magic link / OTP
  if (
    (s.includes("link de acesso") ||
      s.includes("código de acesso") ||
      s.includes("codigo de acesso")) &&
    s.includes(NOME_PRODUTO_LC)
  ) {
    return "login";
  }

  // F075 / F084
  if (
    s.includes("dois dias") ||
    s.includes("duas semanas") ||
    s.includes("desafio de 7 dias")
  ) {
    return "regua";
  }
  if (s.includes("não aparece") || s.includes("nao aparece")) {
    return "regua";
  }

  // F073 — "Ana respondeu no Builders Club" / "3 respostas no Builders Club"
  if (
    s.includes("respondeu no") ||
    s.includes("respostas no") ||
    (s.includes("resposta") && s.includes(NOME_PRODUTO_LC))
  ) {
    return "respostas";
  }

  return "outro";
}

export function categoriaDoEmail(opts: {
  subject: string;
  from?: string | null;
  tags?: Array<{ name: string; value: string }> | null;
}): EmailCategoria | null {
  if (!ehEmailBuildersClub(opts)) return null;

  const tag = opts.tags?.find((t) => t.name === RESEND_TAG_CATEGORY);
  if (tag && isEmailCategoria(tag.value) && tag.value !== "outro") {
    return tag.value;
  }
  return categorizarPorAssunto(opts.subject);
}
