-- AllowedEmail.paid_at: data do pagamento para usar no bootstrap
ALTER TABLE "allowed_email" ADD COLUMN "paid_at" TIMESTAMP(3);

-- HublaWebhookDelivery.status e erro para rastrear processamento
ALTER TABLE "hubla_webhook_delivery" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "hubla_webhook_delivery" ADD COLUMN "erro" TEXT;
