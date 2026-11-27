-- F127 — e-mail de acesso após a compra
CREATE TABLE "purchase_email_send" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3),
    "erro" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_email_send_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "purchase_email_send_email_chave_key" ON "purchase_email_send"("email", "chave");

-- Quem já tinha acesso antes desta feature não recebe o e-mail na próxima
-- mensalidade ou no próximo aviso repetido da Hubla. `erro = 'anterior-f127'`
-- marca a linha como herdada (nunca houve envio).

-- Módulos avulsos já comprados (F126).
INSERT INTO "purchase_email_send" ("id", "email", "chave", "erro")
SELECT gen_random_uuid()::text, lower(trim(mp."email")), 'modulo:' || mp."module_id", 'anterior-f127'
FROM "module_purchase" mp
ON CONFLICT ("email", "chave") DO NOTHING;

-- Membros pagos: PRO (e o `paid` antigo) já tem o plano PRO; Elite tem os dois.
INSERT INTO "purchase_email_send" ("id", "email", "chave", "erro")
SELECT gen_random_uuid()::text, lower(trim(u."email")), 'plano:pro', 'anterior-f127'
FROM "membership" m
JOIN "user" u ON u."id" = m."userId"
WHERE m."tier" IN ('paid', 'pro', 'elite')
ON CONFLICT ("email", "chave") DO NOTHING;

INSERT INTO "purchase_email_send" ("id", "email", "chave", "erro")
SELECT gen_random_uuid()::text, lower(trim(u."email")), 'plano:elite', 'anterior-f127'
FROM "membership" m
JOIN "user" u ON u."id" = m."userId"
WHERE m."tier" = 'elite'
ON CONFLICT ("email", "chave") DO NOTHING;

-- Quem comprou e ainda não criou conta: a allowlist não guarda o plano,
-- então as duas chaves ficam marcadas.
INSERT INTO "purchase_email_send" ("id", "email", "chave", "erro")
SELECT gen_random_uuid()::text, lower(trim(a."email")), k.chave, 'anterior-f127'
FROM "allowed_email" a
CROSS JOIN (VALUES ('plano:pro'), ('plano:elite')) AS k(chave)
WHERE NOT EXISTS (
  SELECT 1 FROM "user" u WHERE lower(trim(u."email")) = lower(trim(a."email"))
)
ON CONFLICT ("email", "chave") DO NOTHING;
