/**
 * F121 — pop-up da Black Infinita no Presente público.
 *
 * Copy e destino vêm da F119/F117. A ordem com a pop-up da aula (F118)
 * mora aqui para testar sem React: nunca os dois ao mesmo tempo.
 */
import { BLACK_INFINITA } from "@/lib/eventos/black-infinita";
import {
  BLACK_INFINITA_FAIXA_COPY,
  BLACK_INFINITA_FAIXA_HREF,
  type StorageLike,
} from "@/lib/presentes/black-infinita-faixa";
import { POPUP_DELAY_MS } from "@/lib/presentes/popup-aula";

export const BLACK_INFINITA_POPUP_KEY = "bc_black_infinita_popup_dismissed";

export const BLACK_INFINITA_POPUP_COPY = BLACK_INFINITA_FAIXA_COPY;

export const BLACK_INFINITA_POPUP_HREF = BLACK_INFINITA_FAIXA_HREF;

export const BLACK_INFINITA_POPUP_CTA = BLACK_INFINITA.naoAluno.cta;

export const BLACK_INFINITA_POPUP_FECHAR =
  "Fechar convite da Black em Dobro Infinita";

/**
 * A pop-up da aula abre em `POPUP_DELAY_MS` (hoje 0). Este folga cobre
 * o timeout + um paint: se `#popup-aula-titulo` não chegou, ela não vai
 * aparecer nesta visita e a Black pode entrar.
 */
export const BLACK_INFINITA_POPUP_AULA_WAIT_MS = POPUP_DELAY_MS + 250;

/**
 * A aula "liberou" a tela quando já fechou, ou quando o delay passou
 * sem ela ter aberto (não vai aparecer). Enquanto está na frente, não.
 */
export function aulaPopupLiberouABlack(opts: {
  viuAulaPopup: boolean;
  aulaPopupAberta: boolean;
  esperaDaAulaExpirou: boolean;
}): boolean {
  if (opts.aulaPopupAberta) return false;
  if (opts.viuAulaPopup) return true;
  return opts.esperaDaAulaExpirou;
}

export function shouldShowBlackInfinitaPopup(opts: {
  loggedIn: boolean;
  dismissedRaw: string | null | undefined;
  aulaPopupAberta: boolean;
  aulaPopupEncerrada: boolean;
}): boolean {
  if (opts.loggedIn) return false;
  if (opts.dismissedRaw === "1") return false;
  if (opts.aulaPopupAberta) return false;
  return opts.aulaPopupEncerrada;
}

export function dismissBlackInfinitaPopup(storage: StorageLike): void {
  storage.setItem(BLACK_INFINITA_POPUP_KEY, "1");
}
