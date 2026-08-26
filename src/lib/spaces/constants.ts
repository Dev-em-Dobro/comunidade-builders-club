/** Slugs de Spaces com comportamento especial na UI. */

export const WELCOME_SPACE_SLUG = "boas-vindas" as const;
/** F056 / F057 — Desafio Projetos (ativação pagante). */
export const PROJETOS_SPACE_SLUG = "projetos" as const;

/** Tutoriais Panda na tela Boas-vindas (F023 / F055 / F058). */
export const WELCOME_TUTORIAL_VIDEO = {
  pandaLibraryId: "77c52f03-dc6",
  title: "Como usar a comunidade",
  /** Plano gratuito. */
  freeVideoExternalId: "79a1c579-1870-48bb-8bf7-5f16f0c1ec91",
  /** Plano pago (e admin/instructor). */
  paidVideoExternalId: "d3b5019d-49b8-479e-a150-7ea654dc7cf6",
} as const;

export function welcomeTutorialVideoId(isPaid: boolean): string {
  return isPaid
    ? WELCOME_TUTORIAL_VIDEO.paidVideoExternalId
    : WELCOME_TUTORIAL_VIDEO.freeVideoExternalId;
}

export const AVISOS_SPACE_SLUG = "avisos" as const;
/** Presentes divulgados no Instagram — leitura pública por slug (F059). */
export const PRESENTES_SPACE_SLUG = "presentes" as const;
/** Threads de comentários das aulas (oculto no menu / feed). */
export const AULA_THREADS_SPACE_SLUG = "aula-threads" as const;

/** Spaces em que só admin pode publicar. */
export const ADMIN_ONLY_PUBLISH_SLUGS = [
  WELCOME_SPACE_SLUG,
  AVISOS_SPACE_SLUG,
  PRESENTES_SPACE_SLUG,
  AULA_THREADS_SPACE_SLUG,
] as const;

/** Spaces sem comentários (orientação / não conversa). */
export const COMMENTS_DISABLED_SPACE_SLUGS = [
  WELCOME_SPACE_SLUG,
  PRESENTES_SPACE_SLUG,
] as const;

/** Não listar no sidebar nem no Feed global. */
export const HIDDEN_NAV_SPACE_SLUGS = [AULA_THREADS_SPACE_SLUG] as const;

export function isAdminOnlyPublishSpace(slug: string): boolean {
  return (ADMIN_ONLY_PUBLISH_SLUGS as readonly string[]).includes(slug);
}

export function isCommentsDisabledSpace(slug: string): boolean {
  return (COMMENTS_DISABLED_SPACE_SLUGS as readonly string[]).includes(slug);
}
