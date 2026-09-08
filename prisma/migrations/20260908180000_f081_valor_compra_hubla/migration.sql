-- F081 — payload bruto Hubla + dinheiro da compra no membership.
ALTER TABLE "hubla_webhook_delivery" ADD COLUMN "payload" JSONB;

ALTER TABLE "membership" ADD COLUMN "valor_centavos" INTEGER;
ALTER TABLE "membership" ADD COLUMN "plano_pago" TEXT;
ALTER TABLE "membership" ADD COLUMN "moeda" TEXT;
ALTER TABLE "membership" ADD COLUMN "ultima_cobranca_em" TIMESTAMP(3);
