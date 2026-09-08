/** F075 / F084 — régua de contato. */

export const TRIGGER_SEM_ACESSO_48H = "sem_acesso_48h";
export const TRIGGER_SEM_AMOSTRA_7D = "sem_amostra_7d";
export const TRIGGER_SEM_ATIVIDADE_14D = "sem_atividade_14d";

export const TRIGGERS_REGUA = [
  TRIGGER_SEM_ACESSO_48H,
  TRIGGER_SEM_AMOSTRA_7D,
  TRIGGER_SEM_ATIVIDADE_14D,
] as const;

export type TriggerRegua = (typeof TRIGGERS_REGUA)[number];

export const MS_DAY = 24 * 60 * 60 * 1000;
export const MS_48H = 48 * 60 * 60 * 1000;
export const MS_7D = 7 * MS_DAY;
export const MS_14D = 14 * MS_DAY;
export const LAST_SEEN_THROTTLE_MS = 15 * 60 * 1000;
/** Teto por execução do cron — Resend em série, sem fila. */
export const MAX_ENVIOS_POR_RUN = 80;

const STORE_SOURCES = new Set(["hubla", "tmb", "orion"]);

export function isTriggerRegua(v: string): v is TriggerRegua {
  return (TRIGGERS_REGUA as readonly string[]).includes(v);
}

/** `member` ativo (free ou pago). Staff fica de fora. */
export function isElegivelReguaMember(m: {
  status: string;
  role: string;
}): boolean {
  return m.status === "active" && m.role === "member";
}

/** Entrada CS (F057): compra na loja se veio dela; senão primeiro login. */
export function entradaCs(opts: {
  loginAt: Date;
  allowlistAt: Date | null;
  allowlistSource: string | null;
}): Date {
  if (
    opts.allowlistAt &&
    opts.allowlistSource &&
    STORE_SOURCES.has(opts.allowlistSource) &&
    opts.allowlistAt.getTime() <= opts.loginAt.getTime() + MS_DAY
  ) {
    return opts.allowlistAt;
  }
  return opts.loginAt;
}

export function shouldSendSemAcesso48h(opts: {
  lastSeenAt: Date | null;
  lastSendAt: Date | null;
  now: Date;
}): boolean {
  if (!opts.lastSeenAt) return false;
  if (opts.now.getTime() - opts.lastSeenAt.getTime() < MS_48H) return false;
  if (opts.lastSendAt && opts.lastSendAt.getTime() >= opts.lastSeenAt.getTime()) {
    return false;
  }
  return true;
}

export function shouldSendSemAmostra7d(opts: {
  entrada: Date;
  temAmostra: boolean;
  lastSendAt: Date | null;
  now: Date;
}): boolean {
  if (opts.temAmostra) return false;
  if (opts.now.getTime() - opts.entrada.getTime() < MS_7D) return false;
  if (opts.lastSendAt) return false;
  return true;
}

export function shouldSendSemAtividade14d(opts: {
  entrada: Date;
  lastActivityAt: Date | null;
  lastSendAt: Date | null;
  now: Date;
}): boolean {
  const clock = opts.lastActivityAt ?? opts.entrada;
  if (opts.now.getTime() - clock.getTime() < MS_14D) return false;
  if (opts.lastSendAt && opts.lastSendAt.getTime() >= clock.getTime()) {
    return false;
  }
  return true;
}

export function lastSeenNeedsTouch(
  lastSeenAt: Date | null,
  now: Date,
): boolean {
  if (!lastSeenAt) return true;
  return now.getTime() - lastSeenAt.getTime() >= LAST_SEEN_THROTTLE_MS;
}

export function maxDate(dates: Array<Date | null | undefined>): Date | null {
  let best: Date | null = null;
  for (const d of dates) {
    if (!d) continue;
    if (!best || d > best) best = d;
  }
  return best;
}
