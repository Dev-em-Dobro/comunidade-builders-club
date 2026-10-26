-- F120 — Black Infinita: acesso vitalício no Club
ALTER TABLE "membership" ADD COLUMN "vitalicio" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "membership" ADD COLUMN "vitalicio_offer_id" TEXT;
ALTER TABLE "membership" ADD COLUMN "vitalicio_granted_at" TIMESTAMP(3);

CREATE INDEX "membership_vitalicio_idx" ON "membership"("vitalicio");
