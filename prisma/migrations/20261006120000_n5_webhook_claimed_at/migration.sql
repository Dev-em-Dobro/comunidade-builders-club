-- N5: Adiciona claimed_at para claim atômico de webhook deliveries
-- Status 'processing' indica que o evento está sendo processado.
-- claimed_at registra quando o claim foi feito, permitindo detectar processing travado.

ALTER TABLE "hubla_webhook_delivery" ADD COLUMN "claimed_at" TIMESTAMP(3);

-- Índice composto para queries de claim atômico
CREATE INDEX "hubla_webhook_delivery_status_claimed_at_idx" ON "hubla_webhook_delivery"("status", "claimed_at");
