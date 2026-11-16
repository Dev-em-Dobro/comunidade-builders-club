-- F126 — aula avulsa (low ticket) via Hubla
ALTER TABLE "module" ADD COLUMN "hubla_product_id" TEXT;
CREATE UNIQUE INDEX "module_hubla_product_id_key" ON "module"("hubla_product_id");

CREATE TABLE "module_purchase" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_purchase_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "module_purchase_email_module_id_key" ON "module_purchase"("email", "module_id");
CREATE INDEX "module_purchase_module_id_idx" ON "module_purchase"("module_id");

ALTER TABLE "module_purchase" ADD CONSTRAINT "module_purchase_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
