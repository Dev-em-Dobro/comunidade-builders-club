/**
 * F125 — pop-up da oferta de alunos da Black Infinita no Club logado.
 *
 * O script (`public/black-popup.js`) é o mesmo das ferramentas; aqui só
 * mora quem vê, para testar sem React.
 */
export const BLACK_ALUNOS_POPUP_SRC = "/black-popup.js";

export function shouldShowBlackAlunosPopup(opts: {
  isPaid: boolean;
  isVitalicio: boolean;
  precisaCienteGarantia: boolean;
}): boolean {
  if (!opts.isPaid) return false;
  if (opts.isVitalicio) return false;
  return !opts.precisaCienteGarantia;
}
