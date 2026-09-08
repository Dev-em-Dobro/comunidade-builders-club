import { prisma } from "@/lib/db";
import { requireAuthEnv } from "@/lib/auth/env";
import {
  sendRegua14dEmail,
  sendRegua48hEmail,
  sendRegua7dEmail,
} from "@/lib/email";
import { postTemLinkPublico } from "@/lib/posts/link-publico";
import { PROJETOS_SPACE_SLUG } from "@/lib/spaces/constants";
import {
  entradaCs,
  isElegivelReguaMember,
  maxDate,
  MAX_ENVIOS_POR_RUN,
  shouldSendSemAcesso48h,
  shouldSendSemAmostra7d,
  shouldSendSemAtividade14d,
  TRIGGER_SEM_ACESSO_48H,
  TRIGGER_SEM_AMOSTRA_7D,
  TRIGGER_SEM_ATIVIDADE_14D,
  TRIGGERS_REGUA,
  type TriggerRegua,
} from "./regras";

function appBaseUrl(): string {
  return requireAuthEnv("BETTER_AUTH_URL").replace(/\/$/, "");
}

export type FiltroDisparoRegua = {
  now?: Date;
  onlyEmail?: string;
  onlyTrigger?: TriggerRegua;
};

export type ContagemTrigger = {
  sent: number;
  skipped: number;
  errors: number;
};

export type ResultadoCronRegua = {
  scanned: number;
  sent: number;
  skipped: number;
  errors: number;
  byTrigger: Record<TriggerRegua, ContagemTrigger>;
};

function vazio(): ContagemTrigger {
  return { sent: 0, skipped: 0, errors: 0 };
}

function resultadoVazio(): ResultadoCronRegua {
  return {
    scanned: 0,
    sent: 0,
    skipped: 0,
    errors: 0,
    byTrigger: {
      [TRIGGER_SEM_ACESSO_48H]: vazio(),
      [TRIGGER_SEM_AMOSTRA_7D]: vazio(),
      [TRIGGER_SEM_ATIVIDADE_14D]: vazio(),
    },
  };
}

function bump(
  resultado: ResultadoCronRegua,
  trigger: TriggerRegua,
  campo: keyof ContagemTrigger,
) {
  resultado[campo] += 1;
  resultado.byTrigger[trigger][campo] += 1;
}

function lastSendMap(
  rows: Array<{ userId: string; trigger: string; sentAt: Date }>,
): Map<string, Date> {
  const map = new Map<string, Date>();
  for (const row of rows) {
    const key = `${row.userId}:${row.trigger}`;
    const atual = map.get(key);
    if (!atual || row.sentAt > atual) map.set(key, row.sentAt);
  }
  return map;
}

export async function dispararRegua(
  filtro: FiltroDisparoRegua = {},
): Promise<ResultadoCronRegua> {
  const now = filtro.now ?? new Date();
  const emailFiltro = filtro.onlyEmail?.trim().toLowerCase();
  const triggers: TriggerRegua[] = filtro.onlyTrigger
    ? [filtro.onlyTrigger]
    : [...TRIGGERS_REGUA];

  const candidatos = await prisma.user.findMany({
    where: {
      membership: {
        status: "active",
        role: "member",
      },
      ...(emailFiltro ? { email: { equals: emailFiltro, mode: "insensitive" } } : {}),
    },
    select: {
      id: true,
      email: true,
      membership: { select: { status: true, role: true, createdAt: true } },
      profile: { select: { displayName: true, lastSeenAt: true, joinedAt: true } },
    },
  });

  const resultado = resultadoVazio();
  resultado.scanned = candidatos.length;
  const membros = candidatos.filter(
    (u) => u.membership && isElegivelReguaMember(u.membership),
  );
  if (membros.length === 0) return resultado;

  const ids = membros.map((u) => u.id);
  const emails = membros.map((u) => u.email.toLowerCase());
  const base = appBaseUrl();
  const projetosUrl = `${base}/spaces/${PROJETOS_SPACE_SLUG}`;

  const [allowlist, posts, comments, reactions, lessons, projetoPosts, envios] =
    await Promise.all([
      prisma.allowedEmail.findMany({
        where: { email: { in: emails } },
        select: { email: true, createdAt: true, source: true },
      }),
      prisma.post.groupBy({
        by: ["authorId"],
        where: { authorId: { in: ids } },
        _max: { createdAt: true },
      }),
      prisma.comment.groupBy({
        by: ["authorId"],
        where: { authorId: { in: ids } },
        _max: { createdAt: true },
      }),
      prisma.reaction.groupBy({
        by: ["userId"],
        where: { userId: { in: ids } },
        _max: { createdAt: true },
      }),
      prisma.lessonProgress.groupBy({
        by: ["userId"],
        where: { userId: { in: ids } },
        _max: { updatedAt: true },
      }),
      prisma.post.findMany({
        where: { authorId: { in: ids }, space: { slug: PROJETOS_SPACE_SLUG } },
        select: { authorId: true, createdAt: true, linkUrl: true, body: true },
      }),
      prisma.reguaEmailSend.findMany({
        where: { userId: { in: ids }, trigger: { in: [...TRIGGERS_REGUA] } },
        select: { userId: true, trigger: true, sentAt: true },
      }),
    ]);

  const allowByEmail = new Map(
    allowlist.map((a) => [a.email.toLowerCase(), a]),
  );
  const lastPost = new Map(
    posts.filter((r) => r._max.createdAt).map((r) => [r.authorId, r._max.createdAt!]),
  );
  const lastComment = new Map(
    comments
      .filter((r) => r._max.createdAt)
      .map((r) => [r.authorId, r._max.createdAt!]),
  );
  const lastReaction = new Map(
    reactions
      .filter((r) => r._max.createdAt)
      .map((r) => [r.userId, r._max.createdAt!]),
  );
  const lastLesson = new Map(
    lessons
      .filter((r) => r._max.updatedAt)
      .map((r) => [r.userId, r._max.updatedAt!]),
  );
  const amostras = new Set(
    projetoPosts
      .filter((p) => postTemLinkPublico(p.linkUrl, p.body))
      .map((p) => p.authorId),
  );
  const sends = lastSendMap(envios);

  const senders: Record<
    TriggerRegua,
    (opts: { to: string; displayName: string }) => Promise<void>
  > = {
    [TRIGGER_SEM_ACESSO_48H]: ({ to, displayName }) =>
      sendRegua48hEmail({ to, displayName, clubUrl: base }),
    [TRIGGER_SEM_AMOSTRA_7D]: ({ to, displayName }) =>
      sendRegua7dEmail({ to, displayName, projetosUrl }),
    [TRIGGER_SEM_ATIVIDADE_14D]: ({ to, displayName }) =>
      sendRegua14dEmail({ to, displayName, clubUrl: base }),
  };

  for (const user of membros) {
    if (resultado.sent >= MAX_ENVIOS_POR_RUN) break;

    const loginAt = user.profile?.joinedAt ?? user.membership!.createdAt;
    const allow = allowByEmail.get(user.email.toLowerCase());
    const entrada = entradaCs({
      loginAt,
      allowlistAt: allow?.createdAt ?? null,
      allowlistSource: allow?.source ?? null,
    });
    const lastActivityAt = maxDate([
      lastPost.get(user.id),
      lastComment.get(user.id),
      lastReaction.get(user.id),
      lastLesson.get(user.id),
    ]);
    const displayName = user.profile?.displayName ?? "Builder";
    const lastSeenAt = user.profile?.lastSeenAt ?? null;

    const deve: Record<TriggerRegua, boolean> = {
      [TRIGGER_SEM_ACESSO_48H]: shouldSendSemAcesso48h({
        lastSeenAt,
        lastSendAt: sends.get(`${user.id}:${TRIGGER_SEM_ACESSO_48H}`) ?? null,
        now,
      }),
      [TRIGGER_SEM_AMOSTRA_7D]: shouldSendSemAmostra7d({
        entrada,
        temAmostra: amostras.has(user.id),
        lastSendAt: sends.get(`${user.id}:${TRIGGER_SEM_AMOSTRA_7D}`) ?? null,
        now,
      }),
      [TRIGGER_SEM_ATIVIDADE_14D]: shouldSendSemAtividade14d({
        entrada,
        lastActivityAt,
        lastSendAt: sends.get(`${user.id}:${TRIGGER_SEM_ATIVIDADE_14D}`) ?? null,
        now,
      }),
    };

    for (const trigger of triggers) {
      if (resultado.sent >= MAX_ENVIOS_POR_RUN) break;
      if (!deve[trigger]) {
        bump(resultado, trigger, "skipped");
        continue;
      }
      try {
        await senders[trigger]({ to: user.email, displayName });
        await prisma.reguaEmailSend.create({
          data: { userId: user.id, trigger },
        });
        sends.set(`${user.id}:${trigger}`, now);
        bump(resultado, trigger, "sent");
      } catch (err) {
        bump(resultado, trigger, "errors");
        console.error(`[F084] falha ao enviar ${trigger}`, user.id, err);
      }
    }
  }

  return resultado;
}

/** Isola o gatilho de 48h (F075). */
export async function dispararReguaSemAcesso48h(
  now = new Date(),
): Promise<ResultadoCronRegua> {
  return dispararRegua({ now, onlyTrigger: TRIGGER_SEM_ACESSO_48H });
}
