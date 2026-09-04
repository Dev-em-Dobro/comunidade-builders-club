-- CreateTable
CREATE TABLE "live_schedule" (
    "id" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL DEFAULT 2,
    "hour" INTEGER NOT NULL DEFAULT 20,
    "minute" INTEGER NOT NULL DEFAULT 0,
    "next_override_at" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_reminder_send" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "live_at" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_reminder_send_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "live_reminder_send_userId_trigger_live_at_idx" ON "live_reminder_send"("userId", "trigger", "live_at");

-- AddForeignKey
ALTER TABLE "live_reminder_send" ADD CONSTRAINT "live_reminder_send_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
