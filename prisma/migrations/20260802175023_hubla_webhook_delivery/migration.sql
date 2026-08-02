-- CreateTable
CREATE TABLE "hubla_webhook_delivery" (
    "idempotency_key" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hubla_webhook_delivery_pkey" PRIMARY KEY ("idempotency_key")
);
