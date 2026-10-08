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

/**
 * Retorna a data no formato YYYY-MM-DD no fuso America/Sao_Paulo.
 * Usa Intl.DateTimeFormat para não depender do TZ do processo.
 */
export function getDateKeySaoPaulo(date: Date): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SAO_PAULO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

/**
 * Converte uma chave YYYY-MM-DD para rótulo DD/MM/YYYY (sem depender do TZ do processo).
 */
export function formatarRotuloDaChave(key: string): string {
  const [year, month, day] = key.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Retorna o início do dia (00:00:00) em São Paulo como UTC timestamp.
 * B1: Usa formato ISO com offset explícito (-03:00) para não depender do TZ do processo.
 * São Paulo não tem horário de verão desde 2019, então -03:00 é fixo.
 */
export function inicioDodiaSaoPaulo(key: string): Date {
  return new Date(`${key}T00:00:00-03:00`);
}

/**
 * Gera array de 7 chaves YYYY-MM-DD (últimos 7 dias incluindo hoje em SP).
 * Usa a chave de hoje como base e subtrai dias diretamente.
 */
export function gerarChaves7Dias(agora: Date): string[] {
  const hojeKey = getDateKeySaoPaulo(agora);
  const [y, m, d] = hojeKey.split("-").map(Number);
  const hoje = new Date(y!, m! - 1, d!);
  const keys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(hoje);
    dt.setDate(dt.getDate() - i);
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    keys.push(`${year}-${month}-${day}`);
  }
  return keys;
}

/**
 * B5: Conta conversões por dia usando as chaves YYYY-MM-DD.
 * Função pura exportada para testes.
 */
export function contarPorDia(
  conversoes: { convertedToPaidAt: Date }[],
  diasValidos: Set<string>,
): Map<string, number> {
  const contagem = new Map<string, number>();
  for (const key of diasValidos) {
    contagem.set(key, 0);
  }
  for (const c of conversoes) {
    const key = getDateKeySaoPaulo(c.convertedToPaidAt);
    if (diasValidos.has(key)) {
      contagem.set(key, (contagem.get(key) ?? 0) + 1);
    }
  }
  return contagem;
}

export async function listarConversoesUltimos7Dias(): Promise<MetricasConversao> {
  const agora = new Date();
  const chaves = gerarChaves7Dias(agora);
  const primeiraChave = chaves[0]!;
  const inicioPeriodo = inicioDodiaSaoPaulo(primeiraChave);

  const conversoes = await prisma.membership.findMany({
    where: {
      convertedToPaidAt: {
        gte: inicioPeriodo,
      },
    },
    select: {
      convertedToPaidAt: true,
    },
  });

  const diasValidos = new Set(chaves);
  const conversoesComData = conversoes.filter(
    (c): c is { convertedToPaidAt: Date } => c.convertedToPaidAt !== null,
  );
  const contagemPorDia = contarPorDia(conversoesComData, diasValidos);

  const conversoesPorDia: ConversaoDiaria[] = [];
  let total7dias = 0;

  for (const key of chaves) {
    const total = contagemPorDia.get(key) ?? 0;
    conversoesPorDia.push({
      data: formatarRotuloDaChave(key),
      total,
    });
    total7dias += total;
  }

  return {
    conversoesPorDia,
    total7dias,
  };
}
