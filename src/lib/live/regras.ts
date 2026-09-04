/** F079 — regra padrão + exceção pontual do horário da live. */

export const TRIGGER_VESPERA = "vespera";
export const TRIGGER_POUCO_ANTES = "pouco_antes";

export const MS_HORA = 60 * 60 * 1000;
/** Janela do lembrete véspera: cobre um cron que roda 1x/dia. */
export const JANELA_VESPERA_INICIO_MS = 24 * MS_HORA;
export const JANELA_VESPERA_FIM_MS = 32 * MS_HORA;
/** Janela do lembrete pouco-antes: até 1h de antecedência. */
export const JANELA_POUCO_ANTES_INICIO_MS = 0;
export const JANELA_POUCO_ANTES_FIM_MS = 1 * MS_HORA;

/** Teto por execução do cron — Resend em série, sem fila (mesmo limite do F075). */
export const MAX_ENVIOS_POR_RUN = 80;

export type RegraLiveSchedule = {
  /** 0=domingo … 6=sábado, no calendário de São Paulo. */
  weekday: number;
  /** hour/minute em horário de São Paulo (BRT), não UTC. */
  hour: number;
  minute: number;
  /** Horário exato da próxima ocorrência quando foge da regra padrão. */
  nextOverrideAt: Date | null;
};

/**
 * Brasil não tem horário de verão desde 2019 — BRT é UTC-3 o ano inteiro.
 * Offset fixo, sem lib de timezone: revisar se essa regra mudar.
 */
const BRT_OFFSET_MS = 3 * 60 * 60 * 1000;

/**
 * Próxima ocorrência da live a partir de `now`.
 *
 * Override só vale enquanto está no futuro — depois que passa, o cálculo
 * volta sozinho pra regra padrão (sem precisar limpar o campo).
 */
export function proximaLive(regra: RegraLiveSchedule, now: Date): Date {
  if (regra.nextOverrideAt && regra.nextOverrideAt.getTime() > now.getTime()) {
    return regra.nextOverrideAt;
  }
  return proximaOcorrenciaDaRegra(regra, now);
}

function proximaOcorrenciaDaRegra(
  regra: Pick<RegraLiveSchedule, "weekday" | "hour" | "minute">,
  now: Date,
): Date {
  // Desloca pro "relógio de São Paulo": os getters UTC* passam a ler
  // weekday/hour como quem mora em BRT enxergaria, sem precisar de lib.
  const nowBRT = new Date(now.getTime() - BRT_OFFSET_MS);

  const candidatoBRT = new Date(nowBRT);
  candidatoBRT.setUTCHours(regra.hour, regra.minute, 0, 0);

  let diasAteODia = (regra.weekday - candidatoBRT.getUTCDay() + 7) % 7;
  if (diasAteODia === 0 && candidatoBRT.getTime() <= nowBRT.getTime()) {
    diasAteODia = 7;
  }
  candidatoBRT.setUTCDate(candidatoBRT.getUTCDate() + diasAteODia);

  return new Date(candidatoBRT.getTime() + BRT_OFFSET_MS);
}

/** `member` ativo (free ou pago). Staff fica de fora — mesma regra do F075. */
export function isElegivelLembreteLive(m: {
  status: string;
  role: string;
}): boolean {
  return m.status === "active" && m.role === "member";
}

function dentroDaJanela(
  distanciaMs: number,
  inicioMs: number,
  fimMs: number,
): boolean {
  return distanciaMs >= inicioMs && distanciaMs < fimMs;
}

/**
 * Dedupe é por ocorrência: `jaEnviado` vem de uma query por
 * (userId, trigger, liveAt) — `liveAt` já muda a cada semana, então não
 * precisa comparar timestamps de envio aqui, só saber se já existe.
 */
export function shouldSendVespera(opts: {
  liveAt: Date;
  now: Date;
  jaEnviado: boolean;
}): boolean {
  if (opts.jaEnviado) return false;
  const distancia = opts.liveAt.getTime() - opts.now.getTime();
  return dentroDaJanela(distancia, JANELA_VESPERA_INICIO_MS, JANELA_VESPERA_FIM_MS);
}

export function shouldSendPoucoAntes(opts: {
  liveAt: Date;
  now: Date;
  jaEnviado: boolean;
}): boolean {
  if (opts.jaEnviado) return false;
  const distancia = opts.liveAt.getTime() - opts.now.getTime();
  return dentroDaJanela(
    distancia,
    JANELA_POUCO_ANTES_INICIO_MS,
    JANELA_POUCO_ANTES_FIM_MS,
  );
}
