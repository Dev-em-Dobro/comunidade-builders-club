-- F054: tentativas de login com e-mail fora da allowlist.
CREATE TABLE "denied_login_attempt" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "app" TEXT NOT NULL DEFAULT 'club',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "denied_login_attempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "denied_login_attempt_createdAt_idx" ON "denied_login_attempt"("createdAt");
CREATE INDEX "denied_login_attempt_email_createdAt_idx" ON "denied_login_attempt"("email", "createdAt");
