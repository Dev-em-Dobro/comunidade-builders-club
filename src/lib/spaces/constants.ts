/** Slugs de Spaces com comportamento especial na UI. */

export const WELCOME_SPACE_SLUG = "boas-vindas" as const;

/** Tutorial da comunidade na tela Boas-vindas (F023). Mesmo vídeo do M01. */
export const WELCOME_TUTORIAL_VIDEO = {
  pandaLibraryId: "77c52f03-dc6",
  pandaVideoExternalId: "38608c40-7b9a-4b30-a33e-287bf5072af3",
  title: "Como usar a comunidade",
} as const;
export const AVISOS_SPACE_SLUG = "avisos" as const;
/** Threads de comentários das aulas (oculto no menu / feed). */
export const AULA_THREADS_SPACE_SLUG = "aula-threads" as const;

/** Spaces em que só admin pode publicar. */
export const ADMIN_ONLY_PUBLISH_SLUGS = [
  WELCOME_SPACE_SLUG,
  AVISOS_SPACE_SLUG,
  AULA_THREADS_SPACE_SLUG,
] as const;

/** Spaces sem comentários (orientação / não conversa). */
export const COMMENTS_DISABLED_SPACE_SLUGS = [WELCOME_SPACE_SLUG] as const;

/** Não listar no sidebar nem no Feed global. */
export const HIDDEN_NAV_SPACE_SLUGS = [AULA_THREADS_SPACE_SLUG] as const;

export function isAdminOnlyPublishSpace(slug: string): boolean {
  return (ADMIN_ONLY_PUBLISH_SLUGS as readonly string[]).includes(slug);
}

export function isCommentsDisabledSpace(slug: string): boolean {
  return (COMMENTS_DISABLED_SPACE_SLUGS as readonly string[]).includes(slug);
}
