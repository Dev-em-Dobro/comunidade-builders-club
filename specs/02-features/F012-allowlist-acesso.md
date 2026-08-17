# F012 — Allowlist de e-mails (acesso aprovado no login)

## Status
Implementada — 2026-07-31

## Objetivo
Alunos cujo e-mail está na allowlist entram no primeiro login **já com
membership `active`** — sem aprovação manual.

Fonte da lista: export Orion (`HublaEntitlement` ativo / `purchaseVerifiedAt`),
CSV de compradores Hubla, ou seed DevQuest (`npm run db:seed:devquest`) —
`source=devquest` e `note` com o `productId` Hubla (oferta distinta do Club).

## Modelo

`AllowedEmail` — `email` (único, normalizado lowercase), `source`, `createdAt`.

## Fluxo

1. Ops importa e-mails (`npm run db:import-allowed`).
2. Aluno faz login (Google / magic link) com o **mesmo e-mail**.
3. `ensureMemberBootstrap` vê allowlist → cria/atualiza `Membership` como `active`.
4. Se `revoked` por admin → **não** reativa automaticamente pela allowlist.
5. E-mail fora da lista → `pending` (admin pode ativar depois, F010).

## Critérios

- [x] E-mail na allowlist → feed liberado no 1º login
- [x] E-mail fora → aguardando ativação
- [x] `revoked` não é revertido pela allowlist
- [x] Script importa CSV e/ou banco Orion (`ORION_DATABASE_URL`)
- [x] Admin pode adicionar e-mail à allowlist
