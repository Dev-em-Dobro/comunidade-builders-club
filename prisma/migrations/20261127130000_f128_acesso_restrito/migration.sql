-- F128 — acesso restrito: comprador só do módulo avulso.
-- Contas existentes ficam com false: ninguém perde acesso.
ALTER TABLE "membership" ADD COLUMN "acesso_restrito" BOOLEAN NOT NULL DEFAULT false;
