-- F058: registro de aceite dos documentos legais.

-- Cache da última versão aceita (hot path do bootstrap).
ALTER TABLE "membership" ADD COLUMN "termos_versao" TEXT;

-- Histórico append-only: uma linha por documento por versão.
CREATE TABLE "legal_acceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "versao" TEXT NOT NULL,
    "aceito_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "legal_acceptance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "legal_acceptance_userId_documento_versao_key" ON "legal_acceptance"("userId", "documento", "versao");
CREATE INDEX "legal_acceptance_userId_idx" ON "legal_acceptance"("userId");

ALTER TABLE "legal_acceptance" ADD CONSTRAINT "legal_acceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
