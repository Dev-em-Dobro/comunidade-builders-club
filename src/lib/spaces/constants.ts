/** Slugs de Spaces com comportamento especial na UI. */

export const WELCOME_SPACE_SLUG = "boas-vindas" as const;
export const AVISOS_SPACE_SLUG = "avisos" as const;
/** Threads de comentários das aulas (oculto no menu / feed). */
export const AULA_THREADS_SPACE_SLUG = "aula-threads" as const;

/** Spaces em que só admin pode publicar. */
export const ADMIN_ONLY_PUBLISH_SLUGS = [
  WELCOME_SPACE_SLUG,
  AVISOS_SPACE_SLUG,
  AULA_THREADS_SPACE_SLUG,
] as const;

/** Não listar no sidebar nem no Feed global. */
export const HIDDEN_NAV_SPACE_SLUGS = [AULA_THREADS_SPACE_SLUG] as const;

export function isAdminOnlyPublishSpace(slug: string): boolean {
  return (ADMIN_ONLY_PUBLISH_SLUGS as readonly string[]).includes(slug);
}
