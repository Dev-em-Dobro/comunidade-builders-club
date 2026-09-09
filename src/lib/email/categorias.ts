/** F085 — categorias dos e-mails transacionais do Club. */

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

export function isEmailCategoria(v: string): v is EmailCategoria {
  return (EMAIL_CATEGORIAS as readonly string[]).includes(v);
}

/**
 * Classifica pelo assunto — fallback para e-mails SMTP legados sem tag.
 * Ordem: live → login → régua → respostas → outro.
 */
export function categorizarPorAssunto(subject: string): EmailCategoria {
  const s = subject.toLowerCase();

  if (s.includes("live")) return "live";
  if (
    s.includes("link de acesso") ||
    s.includes("código de acesso") ||
    s.includes("codigo de acesso")
  ) {
    return "login";
  }
  if (
    s.includes("dois dias") ||
    s.includes("duas semanas") ||
    s.includes("desafio de 7 dias") ||
    s.includes("não aparece") ||
    s.includes("nao aparece")
  ) {
    return "regua";
  }
  if (
    s.includes("respondeu") ||
    s.includes("resposta") ||
    s.includes("coment")
  ) {
    return "respostas";
  }
  return "outro";
}

export function categoriaDoEmail(opts: {
  subject: string;
  tags?: Array<{ name: string; value: string }> | null;
}): EmailCategoria {
  const tag = opts.tags?.find((t) => t.name === RESEND_TAG_CATEGORY);
  if (tag && isEmailCategoria(tag.value)) return tag.value;
  return categorizarPorAssunto(opts.subject);
}
