-- Funil Presente → Bastidores: log de clique no CTA "Entrar no grupo"
-- com snapshot da origem do Membership para calcular taxa de conversão.
-- Dedupe: 1 clique por usuário por dia (unique userId + clickedOn).

CREATE TABLE "bastidores_cta_click" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "origin_gift_slug" TEXT,
    "origin_utm_content" TEXT,
    "clicked_on" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bastidores_cta_click_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bastidores_cta_click_userId_clicked_on_key" ON "bastidores_cta_click"("userId", "clicked_on");
CREATE INDEX "bastidores_cta_click_origin_utm_content_createdAt_idx" ON "bastidores_cta_click"("origin_utm_content", "createdAt");
CREATE INDEX "bastidores_cta_click_origin_gift_slug_createdAt_idx" ON "bastidores_cta_click"("origin_gift_slug", "createdAt");

ALTER TABLE "bastidores_cta_click" ADD CONSTRAINT "bastidores_cta_click_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
