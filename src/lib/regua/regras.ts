/** F075 — um e-mail por episódio de ausência. */

export const TRIGGER_SEM_ACESSO_48H = "sem_acesso_48h";

export const MS_48H = 48 * 60 * 60 * 1000;
export const LAST_SEEN_THROTTLE_MS = 15 * 60 * 1000;
/** Teto por execução do cron — Resend em série, sem fila. */
export const MAX_ENVIOS_POR_RUN = 80;

const TIERS_PAGOS = new Set(["paid", "pro", "elite"]);

/** Pagante `member` ativo. Staff e free ficam de fora. */
export function isElegivelPaganteMember(m: {
  status: string;
  role: string;
  tier: string;
}): boolean {
  if (m.status !== "active") return false;
  if (m.role !== "member") return false;
  return TIERS_PAGOS.has(m.tier);
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

export function lastSeenNeedsTouch(
  lastSeenAt: Date | null,
  now: Date,
): boolean {
  if (!lastSeenAt) return true;
  return now.getTime() - lastSeenAt.getTime() >= LAST_SEEN_THROTTLE_MS;
}
