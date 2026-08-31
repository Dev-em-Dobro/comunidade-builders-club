import { prisma } from "@/lib/db";
import { requireAuthEnv } from "@/lib/auth/env";
import { sendReplyDigestEmail } from "@/lib/email";
import { NOME_PRODUTO } from "@/lib/produto";
import { signEmailUnsubToken, verifyEmailUnsubToken } from "./email-token";
import {
  digestSubject,
  digestText,
  EMAIL_SIGNAL_TYPES,
  shouldSendGroupedEmail,
} from "./regras";

function appBaseUrl(): string {
  return requireAuthEnv("BETTER_AUTH_URL").replace(/\/$/, "");
}

/**
 * Tenta e-mail agrupado para cada destinatário de sinal alto.
 * Falha não sobe: o comentário já foi gravado (F073).
 */
export async function maybeSendGroupedReplyEmails(opts: {
  recipientIds: string[];
  actorId: string;
  actorName: string;
  postId: string;
  snippet: string | null;
}): Promise<void> {
  const unique = [...new Set(opts.recipientIds)].filter(
    (id) => id && id !== opts.actorId,
  );
  if (unique.length === 0) return;

  try {
    const post = await prisma.post.findUnique({
      where: { id: opts.postId },
      select: { title: true },
    });
    if (!post) return;

    await Promise.all(
      unique.map((recipientId) =>
        sendOne(recipientId, {
          actorName: opts.actorName,
          postId: opts.postId,
          postTitle: post.title,
          snippet: opts.snippet,
        }),
      ),
    );
  } catch (err) {
    console.error("[F073] falha ao enviar e-mail de resposta", err);
  }
}

async function sendOne(
  recipientId: string,
  opts: {
    actorName: string;
    postId: string;
    postTitle: string;
    snippet: string | null;
  },
): Promise<void> {
  try {
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        email: true,
        profile: { select: { notifyRepliesEmail: true } },
      },
    });
    if (!recipient?.email || !recipient.profile) return;

    const last = await prisma.notificationEmailSend.findFirst({
      where: { recipientId, postId: opts.postId },
      orderBy: { sentAt: "desc" },
      select: { sentAt: true },
    });

    if (
      !shouldSendGroupedEmail({
        optedIn: recipient.profile.notifyRepliesEmail,
        lastSentAt: last?.sentAt ?? null,
        now: new Date(),
      })
    ) {
      return;
    }

    const eventCount = await prisma.notification.count({
      where: {
        recipientId,
        postId: opts.postId,
        readAt: null,
        type: { in: EMAIL_SIGNAL_TYPES },
      },
    });
    if (eventCount < 1) return;

    const base = appBaseUrl();
    const token = signEmailUnsubToken(recipientId);
    const postUrl = `${base}/posts/${opts.postId}`;
    const unsubUrl = `${base}/email/respostas?t=${encodeURIComponent(token)}`;
    const unsubApiUrl = `${base}/api/email/respostas/unsub?t=${encodeURIComponent(token)}`;
    const subject = digestSubject({
      count: eventCount,
      actorName: opts.actorName,
      product: NOME_PRODUTO,
    });
    const text = digestText({
      actorName: opts.actorName,
      count: eventCount,
      postTitle: opts.postTitle,
      snippet: opts.snippet,
      postUrl,
      unsubUrl,
      product: NOME_PRODUTO,
    });

    await sendReplyDigestEmail({
      to: recipient.email,
      subject,
      text,
      postUrl,
      unsubUrl,
      unsubApiUrl,
      snippet: opts.snippet,
    });

    await prisma.notificationEmailSend.create({
      data: {
        recipientId,
        postId: opts.postId,
        eventCount,
      },
    });
  } catch (err) {
    console.error("[F073] falha ao enviar e-mail de resposta", err);
  }
}

export async function setNotifyRepliesEmail(
  userId: string,
  enabled: boolean,
): Promise<void> {
  await prisma.profile.update({
    where: { userId },
    data: { notifyRepliesEmail: enabled },
  });
}

export async function optOutRepliesEmailByToken(
  token: string,
): Promise<"ok" | "invalid"> {
  const userId = verifyEmailUnsubToken(token);
  if (!userId) return "invalid";
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { userId: true },
  });
  if (!profile) return "invalid";
  await prisma.profile.update({
    where: { userId },
    data: { notifyRepliesEmail: false },
  });
  return "ok";
}
