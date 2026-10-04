-- F109 — Free: aula do desafio -> planos -> checkout.
CREATE TABLE "upgrade_funnel_event" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "plan" TEXT,
    "motivo" TEXT,
    "membership_tier" "MembershipTier" NOT NULL,
    "membership_status" "MembershipStatus" NOT NULL,
    "membership_role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upgrade_funnel_event_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "upgrade_funnel_event_userId_createdAt_idx"
    ON "upgrade_funnel_event"("userId", "createdAt");

CREATE INDEX "upgrade_funnel_event_step_createdAt_idx"
    ON "upgrade_funnel_event"("step", "createdAt");

CREATE INDEX "upgrade_funnel_event_motivo_createdAt_idx"
    ON "upgrade_funnel_event"("motivo", "createdAt");

ALTER TABLE "upgrade_funnel_event"
    ADD CONSTRAINT "upgrade_funnel_event_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
