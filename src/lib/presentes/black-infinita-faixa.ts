/**
 * F119 — faixa da Black em Dobro Infinita no Presente público.
 *
 * Copy, destino e chave de dispensa moram aqui, não no `.tsx`: dá para
 * testar a visibilidade sem React. Sem Prisma. Sem Next.
 *
 * A sessão (logado vs anônimo) a página já resolve com `getOptionalUser`.
 * Este módulo só responde: com essa sessão e esse storage, a faixa entra?
 */
import { BLACK_INFINITA } from "@/lib/eventos/black-infinita";

export const BLACK_INFINITA_FAIXA_KEY = "bc_black_infinita_dismissed";

export const BLACK_INFINITA_FAIXA_COPY =
  "Black em Dobro Infinita: a melhor condição da história da Dev em Dobro. Live gratuita 05/11 às 20h.";

export const BLACK_INFINITA_FAIXA_HREF = BLACK_INFINITA.naoAluno.href;

export const BLACK_INFINITA_FAIXA_FECHAR =
  "Fechar aviso da Black em Dobro Infinita";

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function shouldShowBlackInfinitaFaixa(opts: {
  loggedIn: boolean;
  dismissedRaw: string | null | undefined;
}): boolean {
  if (opts.loggedIn) return false;
  if (opts.dismissedRaw === "1") return false;
  return true;
}

export function dismissBlackInfinitaFaixa(storage: StorageLike): void {
  storage.setItem(BLACK_INFINITA_FAIXA_KEY, "1");
}

export function getBrowserLocalStorage(): StorageLike | null {
  try {
    const s = window.localStorage;
    const probe = "__bc_black_infinita_probe";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}
