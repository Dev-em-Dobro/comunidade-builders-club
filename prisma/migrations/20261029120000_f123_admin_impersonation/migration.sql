-- F123 — Better Auth admin plugin (impersonate) + backfill de admins.

ALTER TABLE "user" ADD COLUMN "role" TEXT DEFAULT 'user';
ALTER TABLE "user" ADD COLUMN "banned" BOOLEAN DEFAULT false;
ALTER TABLE "user" ADD COLUMN "ban_reason" TEXT;
ALTER TABLE "user" ADD COLUMN "ban_expires" TIMESTAMP(3);

ALTER TABLE "session" ADD COLUMN "impersonated_by" TEXT;

UPDATE "user" AS u
SET "role" = 'admin'
FROM "membership" AS m
WHERE m."userId" = u."id"
  AND m."role" = 'admin';
