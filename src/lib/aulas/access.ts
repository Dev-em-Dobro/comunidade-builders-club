/** F065 — herança de `Module.freeAccess` pela árvore. */

/** Submódulo gratuito. Spec F065 / F051 — só o Comece por aqui. */
export const FASE_1_M01_SLUG = "fase-1-m01-comece-por-aqui";

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
