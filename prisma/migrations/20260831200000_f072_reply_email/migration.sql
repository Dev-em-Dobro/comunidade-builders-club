-- F072: preferência de e-mail de respostas + log de debounce por post.
ALTER TABLE "profile"
  ADD COLUMN IF NOT EXISTS "notify_replies_email" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS "notification_email_send" (
  "id" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "event_count" INTEGER NOT NULL DEFAULT 1,

  CONSTRAINT "notification_email_send_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "notification_email_send_recipientId_postId_sentAt_idx"
  ON "notification_email_send"("recipientId", "postId", "sentAt");

ALTER TABLE "notification_email_send"
  ADD CONSTRAINT "notification_email_send_recipientId_fkey"
  FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notification_email_send"
  ADD CONSTRAINT "notification_email_send_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
