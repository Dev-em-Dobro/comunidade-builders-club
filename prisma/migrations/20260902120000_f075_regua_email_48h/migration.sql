-- F075: régua de e-mail (48h sem acesso).
ALTER TABLE "profile" ADD COLUMN IF NOT EXISTS "notify_regua_email" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "profile" ADD COLUMN IF NOT EXISTS "last_seen_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "profile_last_seen_at_idx" ON "profile"("last_seen_at");

CREATE TABLE IF NOT EXISTS "regua_email_send" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regua_email_send_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "regua_email_send_userId_trigger_sentAt_idx"
  ON "regua_email_send"("userId", "trigger", "sentAt");

ALTER TABLE "regua_email_send"
  ADD CONSTRAINT "regua_email_send_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
