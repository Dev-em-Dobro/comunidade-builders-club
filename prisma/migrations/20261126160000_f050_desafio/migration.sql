-- CreateEnum
CREATE TYPE "ChallengeEnrollmentStatus" AS ENUM ('pendente', 'aprovado', 'recusado', 'removido');

-- CreateEnum
CREATE TYPE "WarmContactKind" AS ENUM ('pessoa', 'negocio');

-- CreateEnum
CREATE TYPE "WarmContactStatus" AS ENUM ('listado', 'abordado', 'respondeu', 'briefing', 'proposta', 'fechado', 'perdido');

-- CreateEnum
CREATE TYPE "WarmContactEventType" AS ENUM ('listado', 'abordado', 'respondeu', 'briefing', 'proposta', 'fechado', 'perdido', 'retorno', 'agendamento');

-- CreateTable
CREATE TABLE "challenge_enrollment" (
    "userId" TEXT NOT NULL,
    "status" "ChallengeEnrollmentStatus" NOT NULL DEFAULT 'pendente',
    "whatsapp" TEXT NOT NULL,
    "workStage" TEXT NOT NULL,
    "offer" TEXT NOT NULL,
    "weeklyHours" TEXT NOT NULL,
    "hasPortfolio" BOOLEAN NOT NULL,
    "hasWarmContacts" BOOLEAN NOT NULL,
    "motivation" TEXT NOT NULL,
    "commitments" TEXT[],
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "joinedWeek" INTEGER,
    "removedReason" TEXT,

    CONSTRAINT "challenge_enrollment_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "warm_contact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "WarmContactKind" NOT NULL,
    "note" TEXT,
    "status" "WarmContactStatus" NOT NULL DEFAULT 'listado',
    "approachedAt" TIMESTAMP(3),
    "followUps" INTEGER NOT NULL DEFAULT 0,
    "closedValue" DECIMAL(12,2),
    "nextFollowUpOn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warm_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warm_contact_event" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "type" "WarmContactEventType" NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warm_contact_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_checkin" (
    "userId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "blocker" TEXT NOT NULL,
    "portfolioUrl" TEXT,
    "soldThisWeek" BOOLEAN NOT NULL,
    "soldValue" DECIMAL(12,2),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_checkin_pkey" PRIMARY KEY ("userId","week")
);

-- CreateTable
CREATE TABLE "challenge_required_lesson" (
    "lessonId" TEXT NOT NULL,
    "phase" INTEGER NOT NULL,

    CONSTRAINT "challenge_required_lesson_pkey" PRIMARY KEY ("lessonId")
);

-- CreateIndex
CREATE INDEX "challenge_enrollment_status_idx" ON "challenge_enrollment"("status");

-- CreateIndex
CREATE INDEX "warm_contact_userId_idx" ON "warm_contact"("userId");

-- CreateIndex
CREATE INDEX "warm_contact_event_contactId_at_idx" ON "warm_contact_event"("contactId", "at");

-- AddForeignKey
ALTER TABLE "challenge_enrollment" ADD CONSTRAINT "challenge_enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warm_contact" ADD CONSTRAINT "warm_contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warm_contact_event" ADD CONSTRAINT "warm_contact_event_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "warm_contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_checkin" ADD CONSTRAINT "challenge_checkin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_required_lesson" ADD CONSTRAINT "challenge_required_lesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

