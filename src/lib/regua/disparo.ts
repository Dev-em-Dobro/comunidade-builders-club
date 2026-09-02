import { prisma } from "@/lib/db";
import { requireAuthEnv } from "@/lib/auth/env";
import { sendRegua48hEmail } from "@/lib/email";
import {
  MAX_ENVIOS_POR_RUN,
  shouldSendSemAcesso48h,
  TRIGGER_SEM_ACESSO_48H,
} from "./regras";

function appBaseUrl(): string {
  return requireAuthEnv("BETTER_AUTH_URL").replace(/\/$/, "");
}

export type ResultadoCronRegua = {
  scanned: number;
  sent: number;
  skipped: number;
  errors: number;
};

export async function dispararReguaSemAcesso48h(
  now = new Date(),
): Promise<ResultadoCronRegua> {
  const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const candidatos = await prisma.user.findMany({
    where: {
      membership: {
        status: "active",
        role: "member",
      },
      profile: {
        lastSeenAt: { lte: cutoff },
      },
    },
    select: {
      id: true,
      email: true,
      profile: { select: { displayName: true, lastSeenAt: true } },
      reguaEmailSends: {
        where: { trigger: TRIGGER_SEM_ACESSO_48H },
        orderBy: { sentAt: "desc" },
        take: 1,
      },
    },
    take: MAX_ENVIOS_POR_RUN * 3,
  });

  const resultado: ResultadoCronRegua = {
    scanned: candidatos.length,
    sent: 0,
    skipped: 0,
    errors: 0,
  };

  const base = appBaseUrl();

  for (const user of candidatos) {
    if (resultado.sent >= MAX_ENVIOS_POR_RUN) break;

    const lastSeenAt = user.profile?.lastSeenAt ?? null;
    const lastSendAt = user.reguaEmailSends[0]?.sentAt ?? null;
    if (!shouldSendSemAcesso48h({ lastSeenAt, lastSendAt, now })) {
      resultado.skipped += 1;
      continue;
    }

    try {
      await sendRegua48hEmail({
        to: user.email,
        displayName: user.profile?.displayName ?? "Builder",
        clubUrl: base,
      });
      await prisma.reguaEmailSend.create({
        data: {
          userId: user.id,
          trigger: TRIGGER_SEM_ACESSO_48H,
        },
      });
      resultado.sent += 1;
    } catch (err) {
      resultado.errors += 1;
      console.error("[F075] falha ao enviar régua 48h", user.id, err);
    }
  }

  return resultado;
}
