import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  digestSubject,
  EMAIL_DEBOUNCE_MS,
  isEmailSignalType,
  planCommentNotifications,
  shouldSendGroupedEmail,
} from "./regras";

describe("planCommentNotifications — F072 A", () => {
  it("comentário raiz notifica o autor do post", () => {
    assert.deepEqual(
      planCommentNotifications({
        actorId: "b",
        postAuthorId: "a",
        replyTargetAuthorId: null,
        mentionedIds: [],
      }),
      [{ recipientId: "a", type: "comment_on_post" }],
    );
  });

  it("resposta aninhada notifica quem foi respondido e o autor do post", () => {
    assert.deepEqual(
      planCommentNotifications({
        actorId: "c",
        postAuthorId: "a",
        replyTargetAuthorId: "b",
        mentionedIds: [],
      }),
      [
        { recipientId: "b", type: "reply_on_comment" },
        { recipientId: "a", type: "comment_on_post" },
      ],
    );
  });

  it("resposta ao autor do post não duplica", () => {
    assert.deepEqual(
      planCommentNotifications({
        actorId: "b",
        postAuthorId: "a",
        replyTargetAuthorId: "a",
        mentionedIds: [],
      }),
      [{ recipientId: "a", type: "reply_on_comment" }],
    );
  });

  it("não notifica o próprio autor da ação", () => {
    assert.deepEqual(
      planCommentNotifications({
        actorId: "a",
        postAuthorId: "a",
        replyTargetAuthorId: null,
        mentionedIds: ["a"],
      }),
      [],
    );
  });

  it("menção não duplica quem já foi avisado", () => {
    assert.deepEqual(
      planCommentNotifications({
        actorId: "c",
        postAuthorId: "a",
        replyTargetAuthorId: "b",
        mentionedIds: ["a", "b", "d"],
      }),
      [
        { recipientId: "b", type: "reply_on_comment" },
        { recipientId: "a", type: "comment_on_post" },
        { recipientId: "d", type: "mention_in_comment" },
      ],
    );
  });
});

describe("shouldSendGroupedEmail — F072 B", () => {
  const now = new Date("2026-08-31T18:00:00Z");

  it("envia se nunca enviou", () => {
    assert.equal(
      shouldSendGroupedEmail({ optedIn: true, lastSentAt: null, now }),
      true,
    );
  });

  it("não envia dentro da janela de 2h", () => {
    const last = new Date(now.getTime() - EMAIL_DEBOUNCE_MS + 1_000);
    assert.equal(
      shouldSendGroupedEmail({ optedIn: true, lastSentAt: last, now }),
      false,
    );
  });

  it("envia de novo depois da janela", () => {
    const last = new Date(now.getTime() - EMAIL_DEBOUNCE_MS);
    assert.equal(
      shouldSendGroupedEmail({ optedIn: true, lastSentAt: last, now }),
      true,
    );
  });

  it("opt-out bloqueia mesmo sem envio anterior", () => {
    assert.equal(
      shouldSendGroupedEmail({ optedIn: false, lastSentAt: null, now }),
      false,
    );
  });
});

describe("tipos de e-mail — F072 B", () => {
  it("reação não é sinal de e-mail", () => {
    assert.equal(isEmailSignalType("reaction_on_post"), false);
    assert.equal(isEmailSignalType("comment_on_post"), true);
    assert.equal(isEmailSignalType("reply_on_comment"), true);
  });

  it("assunto agrupa a partir de 2", () => {
    assert.equal(
      digestSubject({ count: 1, actorName: "Ana", product: "Builders Club" }),
      "Ana respondeu no Builders Club",
    );
    assert.equal(
      digestSubject({ count: 3, actorName: "Ana", product: "Builders Club" }),
      "3 respostas no Builders Club",
    );
  });
});
