/** F065 — herança de `Module.freeAccess` pela árvore. */

/** Submódulo gratuito. Spec F065 / F051 — só o Comece por aqui. */
export const FASE_1_M01_SLUG = "fase-1-m01-comece-por-aqui";

/** Primeira aula do M01 — destino do Free (presente, cadastro, aula paga). */
export const AULA_ABERTURA_SLUG = "desafio-quick-win-lovable";

/** Versão com CTA de venda, exibida só para o Free. */
export const AULA_ABERTURA_FREE_VIDEO_ID =
  "8f03bab7-9159-4d65-abcc-674bd650523b";

export const AULAS_FREE_HREF = `/aulas/${FASE_1_M01_SLUG}/${AULA_ABERTURA_SLUG}`;

export function lessonVideoId(opts: {
  isPaid: boolean;
  moduleSlug: string;
  lessonSlug: string;
  defaultVideoId: string | null;
}): string | null {
  return !opts.isPaid &&
    opts.moduleSlug === FASE_1_M01_SLUG &&
    opts.lessonSlug === AULA_ABERTURA_SLUG
    ? AULA_ABERTURA_FREE_VIDEO_ID
    : opts.defaultVideoId;
}

export type ModuleAccessNode = {
  freeAccess: boolean;
  slug?: string;
  parent?: ModuleAccessNode | null;
};

export function moduleAllowsFree(mod: ModuleAccessNode): boolean {
  let cur: ModuleAccessNode | null | undefined = mod;
  while (cur) {
    if (cur.freeAccess || cur.slug === FASE_1_M01_SLUG) return true;
    cur = cur.parent;
  }
  return false;
}

export function canWatchLesson(
  isPaid: boolean,
  mod: ModuleAccessNode,
): boolean {
  return isPaid || moduleAllowsFree(mod);
}
