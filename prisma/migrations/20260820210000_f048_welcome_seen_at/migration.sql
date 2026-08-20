-- F048 — primeiro acesso ao feed redireciona para Boas-vindas.
ALTER TABLE "profile" ADD COLUMN "welcome_seen_at" TIMESTAMP(3);

-- Membros já existentes: não forçar onboarding de novo.
UPDATE "profile" SET "welcome_seen_at" = "joinedAt" WHERE "welcome_seen_at" IS NULL;
