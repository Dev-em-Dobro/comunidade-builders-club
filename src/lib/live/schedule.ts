import { prisma } from "@/lib/db";
import { proximaLive, type RegraLiveSchedule } from "./regras";

/** Terça 20h — mesmo default documentado na spec (F078). */
const REGRA_PADRAO: Omit<RegraLiveSchedule, "nextOverrideAt"> = {
  weekday: 2,
  hour: 20,
  minute: 0,
};

/**
 * `LiveSchedule` é linha única (config). Cria com o default na primeira
 * leitura em vez de depender de seed — mesma lógica de "sem toque manual".
 */
export async function obterRegraLiveSchedule(): Promise<RegraLiveSchedule> {
  const existente = await prisma.liveSchedule.findFirst();
  if (existente) return existente;

  const criado = await prisma.liveSchedule.create({ data: REGRA_PADRAO });
  return criado;
}

export async function obterProximaLive(now = new Date()): Promise<Date> {
  const regra = await obterRegraLiveSchedule();
  return proximaLive(regra, now);
}

export async function atualizarLiveSchedule(input: {
  weekday: number;
  hour: number;
  minute: number;
  nextOverrideAt: Date | null;
}): Promise<RegraLiveSchedule> {
  const existente = await prisma.liveSchedule.findFirst();
  if (existente) {
    return prisma.liveSchedule.update({
      where: { id: existente.id },
      data: input,
    });
  }
  return prisma.liveSchedule.create({ data: input });
}
