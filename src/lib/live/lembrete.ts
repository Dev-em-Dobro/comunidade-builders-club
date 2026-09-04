import { prisma } from "@/lib/db";
import { requireAuthEnv } from "@/lib/auth/env";
import { sendLiveLembreteEmail } from "@/lib/email";
import { obterRegraLiveSchedule } from "./schedule";
import { proximaLive } from "./regras";
import {
  MAX_ENVIOS_POR_RUN,
  shouldSendPoucoAntes,
  shouldSendVespera,
  TRIGGER_POUCO_ANTES,
  TRIGGER_VESPERA,
} from "./regras";

function appBaseUrl(): string {
  return requireAuthEnv("BETTER_AUTH_URL").replace(/\/$/, "");
}

export type ResultadoCronLive = {
  liveAt: string;
  scanned: number;
  sent: number;
  skipped: number;
  errors: number;
};

/**
 * F078 — dois disparos por ocorrência da live: véspera e pouco antes.
 * Elegibilidade e dedupe seguem o mesmo padrão do F075
 * (`dispararReguaSemAcesso48h`), trocando o relógio: aqui é a distância
 * até `liveAt`, não o `lastSeenAt`.
 */
export async function dispararLembretesLive(
  now = new Date(),
): Promise<ResultadoCronLive> {
  const regra = await obterRegraLiveSchedule();
  const liveAt = proximaLive(regra, now);
  /** CTA do e-mail: Zoom quando configurado, senão cai pro Club. */
  const ctaUrl = regra.zoomUrl?.trim() || appBaseUrl();

  const candidatos = await prisma.user.findMany({
    where: {
      membership: { status: "active", role: "member" },
    },
    select: {
      id: true,
      email: true,
      profile: { select: { displayName: true } },
      liveReminderSends: {
        where: { liveAt },
        select: { trigger: true },
      },
    },
    take: MAX_ENVIOS_POR_RUN * 3,
  });

  const resultado: ResultadoCronLive = {
    liveAt: liveAt.toISOString(),
    scanned: candidatos.length,
    sent: 0,
    skipped: 0,
    errors: 0,
  };

  for (const user of candidatos) {
    if (resultado.sent >= MAX_ENVIOS_POR_RUN) break;

    const enviados = new Set(user.liveReminderSends.map((s) => s.trigger));
    const trigger = escolherTrigger({
      liveAt,
      now,
      jaEnviouVespera: enviados.has(TRIGGER_VESPERA),
      jaEnviouPoucoAntes: enviados.has(TRIGGER_POUCO_ANTES),
    });

    if (!trigger) {
      resultado.skipped += 1;
      continue;
    }

    try {
      await sendLiveLembreteEmail({
        to: user.email,
        displayName: user.profile?.displayName ?? "Builder",
        ctaUrl,
        liveAt,
        trigger,
      });
      await prisma.liveReminderSend.create({
        data: { userId: user.id, trigger, liveAt },
      });
      resultado.sent += 1;
    } catch (err) {
      resultado.errors += 1;
      console.error("[F078] falha ao enviar lembrete de live", user.id, err);
    }
  }

  return resultado;
}

function escolherTrigger(opts: {
  liveAt: Date;
  now: Date;
  jaEnviouVespera: boolean;
  jaEnviouPoucoAntes: boolean;
}): typeof TRIGGER_VESPERA | typeof TRIGGER_POUCO_ANTES | null {
  if (
    shouldSendPoucoAntes({
      liveAt: opts.liveAt,
      now: opts.now,
      jaEnviado: opts.jaEnviouPoucoAntes,
    })
  ) {
    return TRIGGER_POUCO_ANTES;
  }
  if (
    shouldSendVespera({
      liveAt: opts.liveAt,
      now: opts.now,
      jaEnviado: opts.jaEnviouVespera,
    })
  ) {
    return TRIGGER_VESPERA;
  }
  return null;
}
