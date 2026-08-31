import type { NotificationType } from "@prisma/client";

/** F073 — tipos que podem sair por e-mail. Reação fica só in-app. */
export const EMAIL_SIGNAL_TYPES: NotificationType[] = [
  "comment_on_post",
  "reply_on_comment",
  "mention_in_post",
  "mention_in_comment",
];

export const EMAIL_DEBOUNCE_MS = 2 * 60 * 60 * 1000;

export type CommentNotifPlan = {
  recipientId: string;
  type: NotificationType;
};

/**
 * Quem recebe in-app de um comentário. A primeira regra ganha: resposta
 * no comentário é mais específica que "comentou no seu post".
 */
export function planCommentNotifications(opts: {
  actorId: string;
  postAuthorId: string;
  replyTargetAuthorId: string | null;
  mentionedIds: string[];
}): CommentNotifPlan[] {
  const plans: CommentNotifPlan[] = [];
  const seen = new Set<string>();

  const add = (recipientId: string, type: NotificationType) => {
    if (!recipientId || recipientId === opts.actorId) return;
    if (seen.has(recipientId)) return;
    seen.add(recipientId);
    plans.push({ recipientId, type });
  };

  if (opts.replyTargetAuthorId) {
    add(opts.replyTargetAuthorId, "reply_on_comment");
  }
  add(opts.postAuthorId, "comment_on_post");
  for (const id of opts.mentionedIds) {
    add(id, "mention_in_comment");
  }
  return plans;
}

export function shouldSendGroupedEmail(opts: {
  optedIn: boolean;
  lastSentAt: Date | null;
  now: Date;
  windowMs?: number;
}): boolean {
  if (!opts.optedIn) return false;
  if (!opts.lastSentAt) return true;
  const windowMs = opts.windowMs ?? EMAIL_DEBOUNCE_MS;
  return opts.now.getTime() - opts.lastSentAt.getTime() >= windowMs;
}

export function digestSubject(opts: {
  count: number;
  actorName: string;
  product: string;
}): string {
  if (opts.count <= 1) {
    return `${opts.actorName} respondeu no ${opts.product}`;
  }
  return `${opts.count} respostas no ${opts.product}`;
}

export function digestText(opts: {
  actorName: string;
  count: number;
  postTitle: string;
  snippet: string | null;
  postUrl: string;
  unsubUrl: string;
  product: string;
}): string {
  const linhas = [
    `Olá,`,
    ``,
    opts.count <= 1
      ? `${opts.actorName} respondeu no ${opts.product}.`
      : `${opts.count} respostas no seu post no ${opts.product}.`,
  ];
  if (opts.postTitle.trim()) {
    linhas.push(``, opts.postTitle.trim());
  }
  if (opts.snippet?.trim()) {
    linhas.push(``, `“${opts.snippet.trim()}”`);
  }
  linhas.push(
    ``,
    `Abrir a conversa: ${opts.postUrl}`,
    ``,
    `Reações não geram e-mail. No máximo um aviso a cada 2 horas por post.`,
    ``,
    `Não quero mais estes e-mails: ${opts.unsubUrl}`,
    ``,
    `— ${opts.product}`,
  );
  return linhas.join("\n");
}

export function isEmailSignalType(type: NotificationType): boolean {
  return EMAIL_SIGNAL_TYPES.includes(type);
}
