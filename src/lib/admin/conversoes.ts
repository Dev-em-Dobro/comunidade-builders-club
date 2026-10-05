// Métricas de conversão Free→pago (via Hubla).

import { prisma } from "@/lib/db";

const SAO_PAULO_TZ = "America/Sao_Paulo";

export type ConversaoDiaria = {
  data: string;
  total: number;
};

export type MetricasConversao = {
  conversoesPorDia: ConversaoDiaria[];
  total7dias: number;
};

function formatarDataBR(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: SAO_PAULO_TZ,
  }).format(date);
}

function inicioDodia(date: Date, tz: string): Date {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "01";
  const isoDate = `${get("year")}-${get("month")}-${get("day")}T00:00:00`;
  const offset = getTimezoneOffset(tz, date);
  return new Date(new Date(isoDate).getTime() - offset);
}

function getTimezoneOffset(tz: string, date: Date): number {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: tz }));
  return tzDate.getTime() - utcDate.getTime();
}

function getDateKeyBR(date: Date): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SAO_PAULO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

export async function listarConversoesUltimos7Dias(): Promise<MetricasConversao> {
  const agora = new Date();
  const inicioPeriodo = inicioDodia(agora, SAO_PAULO_TZ);
  inicioPeriodo.setDate(inicioPeriodo.getDate() - 6);

  const conversoes = await prisma.membership.findMany({
    where: {
      convertedToPaidAt: {
        gte: inicioPeriodo,
      },
    },
    select: {
      convertedToPaidAt: true,
    },
    orderBy: {
      convertedToPaidAt: "asc",
    },
  });

  const contagemPorDia = new Map<string, number>();

  for (let i = 0; i < 7; i++) {
    const dia = new Date(inicioPeriodo);
    dia.setDate(dia.getDate() + i);
    const key = getDateKeyBR(dia);
    contagemPorDia.set(key, 0);
  }

  for (const c of conversoes) {
    if (c.convertedToPaidAt) {
      const key = getDateKeyBR(c.convertedToPaidAt);
      if (contagemPorDia.has(key)) {
        contagemPorDia.set(key, (contagemPorDia.get(key) ?? 0) + 1);
      }
    }
  }

  const conversoesPorDia: ConversaoDiaria[] = [];
  let total7dias = 0;

  for (const [key, total] of contagemPorDia.entries()) {
    const parts = key.split("-").map(Number);
    const year = parts[0] ?? 2026;
    const month = parts[1] ?? 1;
    const day = parts[2] ?? 1;
    const date = new Date(year, month - 1, day);
    conversoesPorDia.push({
      data: formatarDataBR(date),
      total,
    });
    total7dias += total;
  }

  return {
    conversoesPorDia,
    total7dias,
  };
}
