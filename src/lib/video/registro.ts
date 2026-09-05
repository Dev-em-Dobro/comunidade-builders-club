import { prisma } from "@/lib/db";

/**
 * F080 — registro de audiência de vídeo.
 *
 * O buraco que isto fecha: até aqui NENHUM vídeo da casa deixava rastro. O
 * progresso de aula (`lesson_progress`) só nascia do clique em "marcar como
 * concluída", então "abriu e não completou" e "nunca abriu" eram a mesma linha
 * — e o vídeo de boas-vindas, que nem aula é, não deixava nada.
 */

export const FONTES = ["boas-vindas", "aula"] as const;
export type FonteVideo = (typeof FONTES)[number];

/** Vídeo de uma hora dá 3600; acima disso é relógio maluco ou clique em barra. */
const TETO_SEGUNDOS = 6 * 60 * 60;

export function fonteValida(v: unknown): v is FonteVideo {
  return typeof v === "string" && (FONTES as readonly string[]).includes(v);
}

export type EntradaPlay = {
  userId: string;
  fonte: FonteVideo;
  videoId: string;
  lessonId?: string | null;
  segundos?: number | null;
};

/**
 * Grava (ou avança) a audiência. O `segundos` só SOBE: quem assistiu 8 minutos
 * e reabre no começo continua com 8 — o que interessa é o ponto mais longe
 * alcançado, não onde o cursor está agora.
 *
 * Quando é aula, espelha em `lesson_progress.seconds`, a coluna que existia no
 * banco desde o começo e nunca teve ninguém para escrevê-la. Espelhar em vez de
 * substituir: o `completedAt` continua sendo do botão, e as duas informações
 * passam a conviver — "assistiu 12 min" e "marcou como concluída" são coisas
 * diferentes, e é justamente a diferença entre elas que a casa quer ver.
 */
export async function registrarPlay(e: EntradaPlay): Promise<{ segundos: number }> {
  const segundos = Math.min(
    TETO_SEGUNDOS,
    Math.max(0, Math.floor(Number(e.segundos ?? 0) || 0)),
  );

  const registro = await prisma.videoPlay.upsert({
    where: { userId_videoId: { userId: e.userId, videoId: e.videoId } },
    create: {
      userId: e.userId,
      fonte: e.fonte,
      videoId: e.videoId,
      lessonId: e.lessonId ?? null,
      segundos,
    },
    update: {},
  });

  if (segundos > registro.segundos) {
    const atualizado = await prisma.videoPlay.update({
      where: { id: registro.id },
      data: { segundos },
    });
    await espelharNaAula(e, segundos);
    return { segundos: atualizado.segundos };
  }

  await espelharNaAula(e, segundos);
  return { segundos: registro.segundos };
}

async function espelharNaAula(e: EntradaPlay, segundos: number): Promise<void> {
  if (e.fonte !== "aula" || !e.lessonId) return;
  const atual = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: e.userId, lessonId: e.lessonId } },
    select: { id: true, seconds: true },
  });
  if (!atual) {
    // Nasce SEM completedAt: dar play não é concluir. Essa distinção é o
    // motivo de tudo isto existir.
    await prisma.lessonProgress.create({
      data: { userId: e.userId, lessonId: e.lessonId, seconds: segundos },
    });
    return;
  }
  if (segundos > atual.seconds) {
    await prisma.lessonProgress.update({
      where: { id: atual.id },
      data: { seconds: segundos },
    });
  }
}
