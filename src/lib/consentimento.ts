/**
 * F057 — consentimento de cookies.
 *
 * O app só usa cookie estritamente necessário (sessão do Better Auth), que não
 * depende de consentimento prévio. Este módulo existe para o que vem depois:
 * analytics/pixel só entram na página com aceite explícito.
 *
 * Sem dependência de Next — a leitura server-side recebe o valor do cookie.
 */

export const COOKIE_CONSENTIMENTO = "bc_consent";

/** 6 meses. Depois disso, perguntamos de novo. */
export const CONSENTIMENTO_MAX_AGE = 60 * 60 * 24 * 180;

/** Versão do aviso. Mudar invalida decisões antigas e reabre o banner. */
export const VERSAO_CONSENTIMENTO = "v1";

export type Decisao = "aceito" | "recusado";

export type Consentimento = {
  versao: string;
  decisao: Decisao;
};

/** Formato do cookie: `v1:aceito`. Curto porque viaja em todo request. */
export function serializarConsentimento(decisao: Decisao): string {
  return `${VERSAO_CONSENTIMENTO}:${decisao}`;
}

export function lerConsentimento(
  valor: string | undefined | null,
): Consentimento | null {
  if (!valor) return null;
  const [versao, decisao] = valor.split(":");
  if (!versao || (decisao !== "aceito" && decisao !== "recusado")) return null;
  // Aviso mudou desde a decisão — vale perguntar de novo.
  if (versao !== VERSAO_CONSENTIMENTO) return null;
  return { versao, decisao };
}

/**
 * Único portão para scripts de terceiro. Ausência de decisão é "não" —
 * silêncio não vale como aceite.
 */
export function consentiuAnalytics(valor: string | undefined | null): boolean {
  return lerConsentimento(valor)?.decisao === "aceito";
}

/** Decisão ainda não tomada (ou de versão antiga) — banner deve aparecer. */
export function precisaDecidir(valor: string | undefined | null): boolean {
  return lerConsentimento(valor) === null;
}

/** CookieConsent dispara depois do aceite para o Clarity ligar sem reload. */
export const CONSENTIMENTO_ANALYTICS_EVENT = "bc-consent-analytics";

/** F074 — portão único: tem Project ID e o membro aceitou medição. */
export function shouldLoadClarity(opts: {
  projectId: string | undefined | null;
  consentCookie: string | undefined | null;
}): boolean {
  const id = opts.projectId?.trim();
  if (!id) return false;
  return consentiuAnalytics(opts.consentCookie);
}
