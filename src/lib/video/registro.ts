import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * F080 — registro de audiência de vídeo.
 *
 * O buraco que isto fecha: até aqui NENHUM vídeo da casa deixava rastro. O
 * progresso de aula (`lesson_progress`) só nascia do clique em "marcar como
 * concluída", então "abriu e não completou" e "nunca abriu" eram a mesma linha
 * — e o vídeo de boas-vindas, que nem aula é, não deixava nada.
 *
 * CUSTO. Este caminho roda a cada marco de vídeo assistido, de toda pessoa, em
 * todo vídeo: é o endpoint mais chamado da casa. Por isso ele é UMA query
 * (duas quando é aula), com o `GREATEST` resolvendo dentro do banco o "só
 * sobe" que em código custaria um SELECT antes de cada escrita.
 */

export const FONTES = ["boas-vindas", "aula"] as const;
export type FonteVideo = (typeof FONTES)[number];

/** Vídeo de seis horas não existe aqui; acima disso é relógio maluco. */
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

export function normalizarSegundos(v: unknown): number {
  const n = Math.floor(Number(v ?? 0));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(TETO_SEGUNDOS, n);
}

/**
 * Grava (ou avança) a audiência. O `segundos` só SOBE, e aqui isso significa
 * outra coisa desde 05/09/2026: é tempo ASSISTIDO acumulado na sessão (ver
 * `lib/video/tempo.ts`), não o ponto mais longe alcançado. Só sobe porque
 * quem volta ao vídeo noutro dia recomeça a contagem do zero no navegador, e
 * a audiência de ontem não pode ser apagada por isso.
 *
 * Quando é aula, espelha em `lesson_progress.seconds`, a coluna que existia no
 * banco desde o começo e nunca teve ninguém para escrevê-la. Espelha em vez de
 * substituir: o `completedAt` continua sendo do botão, e as duas informações
 * passam a conviver — "assistiu 12 min" e "marcou como concluída" são coisas
 * diferentes, e é a diferença entre elas que a casa quer enxergar.
 */
export async function registrarPlay(e: EntradaPlay): Promise<{ segundos: number }> {
  const segundos = normalizarSegundos(e.segundos);
  const lessonId = e.fonte === "aula" && e.lessonId ? e.lessonId : null;

  const [linha] = await prisma.$queryRaw<{ segundos: number }[]>(Prisma.sql`
    INSERT INTO video_play ("id", "userId", "fonte", "lessonId", "videoId", "segundos", "createdAt", "updatedAt")
    VALUES (${randomUUID()}, ${e.userId}, ${e.fonte}, ${lessonId}, ${e.videoId}, ${segundos}, now(), now())
    ON CONFLICT ("userId", "videoId") DO UPDATE
      SET "segundos" = GREATEST(video_play."segundos", EXCLUDED."segundos"),
          "updatedAt" = now()
    RETURNING "segundos"
  `);

  if (lessonId) {
    // O progresso nasce SEM completedAt: dar play não é concluir, e essa
    // distinção é o motivo de tudo isto existir.
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO lesson_progress ("id", "userId", "lessonId", "seconds", "createdAt", "updatedAt")
      VALUES (${randomUUID()}, ${e.userId}, ${lessonId}, ${segundos}, now(), now())
      ON CONFLICT ("userId", "lessonId") DO UPDATE
        SET "seconds" = GREATEST(lesson_progress."seconds", EXCLUDED."seconds"),
            "updatedAt" = now()
    `);
  }

  return { segundos: linha?.segundos ?? segundos };
}
