-- Hubla conversões tracking: campos extras na tabela de delivery + data de conversão.

-- Expandir HublaWebhookDelivery com product_id, offer_id, email, membership_id
ALTER TABLE "hubla_webhook_delivery" ADD COLUMN "product_id" TEXT;
ALTER TABLE "hubla_webhook_delivery" ADD COLUMN "offer_id" TEXT;
ALTER TABLE "hubla_webhook_delivery" ADD COLUMN "email" TEXT;
ALTER TABLE "hubla_webhook_delivery" ADD COLUMN "membership_id" TEXT;

-- Índices para consulta
CREATE INDEX "hubla_webhook_delivery_email_idx" ON "hubla_webhook_delivery"("email");
CREATE INDEX "hubla_webhook_delivery_processed_at_idx" ON "hubla_webhook_delivery"("processed_at");

-- Data em que membro virou pagante (Free/novo → pro/elite)
ALTER TABLE "membership" ADD COLUMN "converted_to_paid_at" TIMESTAMP(3);
CREATE INDEX "membership_converted_to_paid_at_idx" ON "membership"("converted_to_paid_at");
