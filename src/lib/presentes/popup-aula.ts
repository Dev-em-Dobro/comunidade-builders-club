import { AULAS_FREE_HREF } from "@/lib/aulas/access";
import {
  CONSENTIMENTO_ANALYTICS_EVENT,
  COOKIE_CONSENTIMENTO,
  precisaDecidir,
} from "@/lib/consentimento";
import { PROMESSA_PRIMEIRO_CLIENTE } from "@/lib/membership/checkout";

/**
 * F078 — pop-up da aula no Presente.
 *
 * Copy, destino e delay moram aqui, e não no `.tsx`, pelo mesmo motivo da F077:
 * dá para testar sem React e trocar texto sem abrir componente.
 *
 * Sem Prisma de propósito. A contagem de aulas consulta o banco e vive em
 * `@/lib/aulas`; aqui ela chega pronta, como número.
 *
 * Sem `localStorage`: a dispensa não é lembrada (decisão 5). Fechar vale para
 * aquela visita; voltar ao Presente é uma chance nova.
 */

/** Aula que abre o módulo gratuito — destino de cadastro no Presente (F078 pop-up, F083 rodapé). */
export const AULA_ABERTURA_HREF = AULAS_FREE_HREF;

/**
 * Zero: a modal abre assim que a página hidrata (decisão 1).
 *
 * Era 60.000 até 04/09/2026, e aquele minuto de leitura era o único argumento
 * que sustentava a exceção à regra da F063 de não pôr oferta antes do conteúdo.
 * Com zero, a oferta chega antes de qualquer leitura — decisão do dono do
 * produto, tomada com o número do funil na mesa.
 *
 * O `<article>` ainda pinta antes: isto é client component e o efeito só roda
 * depois da hidratação. Não é gate de servidor — quem fecha lê o Presente
 * inteiro.
 *
 * Se a leitura do Presente cair, ou se chegar reclamação de tráfego frio, este
 * é o número que volta.
 */
export const POPUP_DELAY_MS = 0;

export const POPUP_AULA = {
  eyebrow: "Aulas liberadas",
  promessa: PROMESSA_PRIMEIRO_CLIENTE,
  cta: "Quero assistir agora",
  dispensar: "Agora não",
  fechar: "Fechar",
} as const;

/**
 * F118 — fade só de opacity na posição final (centro no `md+`, rodapé
 * abaixo). Sem translate. `prefers-reduced-motion` zera a animação.
 */
export const POPUP_FADE_CLASS = "popup-aula-fade" as const;

/**
 * F118 — no mobile, o overlay não reserva `--bc-consent-h`: a pop-up só
 * abre depois da decisão de cookies, então cola no rodapé. A classe
 * ainda ancora o `safe-area` em `globals.css`.
 */
export const POPUP_OVERLAY_CLASS = "popup-aula-overlay" as const;

/** Mesma fonte do aviso: cookie `bc_consent` + `precisaDecidir` (F057). */
export function valorCookie(
  documentCookie: string,
  nome: string,
): string | undefined {
  const alvo = `${nome}=`;
  for (const parte of documentCookie.split("; ")) {
    if (parte.startsWith(alvo)) {
      return decodeURIComponent(parte.slice(alvo.length));
    }
  }
  return undefined;
}

export function cookieConsentimentoAtual(
  documentCookie: string,
): string | undefined {
  return valorCookie(documentCookie, COOKIE_CONSENTIMENTO);
}

/**
 * Pendente = aviso na tela = pop-up fechada. Aceito ou recusado = abre.
 * Versão antiga do cookie conta como pendente (F057).
 */
export function deveAbrirPopupAula(
  consentCookie: string | null | undefined,
): boolean {
  return !precisaDecidir(consentCookie);
}

const POLL_CONSENTIMENTO_MS = 200;

/**
 * Aceite dispara `CONSENTIMENTO_ANALYTICS_EVENT`; recusa só grava o
 * cookie. O poll cobre a recusa sem mexer em `cookie-consent.tsx`.
 */
export function aguardarConsentimentoParaPopup(opts: {
  lerCookie: () => string | undefined;
  onLiberado: () => void;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
  setInterval: (fn: () => void, ms: number) => number;
  clearInterval: (id: number) => void;
}): () => void {
  let encerrado = false;
  let intervalId: number | undefined;

  const tentar = () => {
    if (encerrado) return;
    if (!deveAbrirPopupAula(opts.lerCookie())) return;
    encerrado = true;
    if (intervalId !== undefined) opts.clearInterval(intervalId);
    opts.removeEventListener(CONSENTIMENTO_ANALYTICS_EVENT, tentar);
    opts.onLiberado();
  };

  opts.addEventListener(CONSENTIMENTO_ANALYTICS_EVENT, tentar);
  tentar();
  if (!encerrado) {
    intervalId = opts.setInterval(tentar, POLL_CONSENTIMENTO_MS);
  }

  return () => {
    encerrado = true;
    if (intervalId !== undefined) opts.clearInterval(intervalId);
    opts.removeEventListener(CONSENTIMENTO_ANALYTICS_EVENT, tentar);
  };
}

/**
 * O número vem do banco (decisão 4.1). Sem número — contagem falhou ou veio
 * zero — a copy perde força, mas não mente.
 */
export function tituloPopup(totalAulas: number): string {
  return totalAulas > 0
    ? `Quer acesso gratuito às ${totalAulas} primeiras aulas?`
    : "Quer acesso gratuito às primeiras aulas?";
}

export function subheadPopup(totalAulas: number): string {
  const quantas =
    totalAulas > 0 ? `as ${totalAulas} primeiras aulas` : "as primeiras aulas";
  return `Criando sua conta grátis você assiste ${quantas} do Builders Club — o que construir e vender com IA, e o desafio do primeiro projeto em 7 dias.`;
}
