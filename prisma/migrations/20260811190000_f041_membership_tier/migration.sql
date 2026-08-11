-- F041: Membership.tier (free | paid). Membros active existentes → paid.
CREATE TYPE "MembershipTier" AS ENUM ('free', 'paid');

ALTER TABLE "membership"
  ADD COLUMN "tier" "MembershipTier" NOT NULL DEFAULT 'free';

UPDATE "membership" SET "tier" = 'paid' WHERE "status" = 'active';

CREATE INDEX "membership_tier_idx" ON "membership"("tier");
