# ADR-006 — Webhook Hubla no Club (allowlist)

## Status
Aceito — 2026-08-02

## Contexto
Acesso pré-aprovado usa `AllowedEmail` (F012). Import manual não escala.
Orion já recebe Hubla (F019); o Club precisa da mesma fonte, em banco próprio.

## Decisão
Endpoint próprio `POST /api/webhooks/hubla` no Club. Parse dos eventos v2
(member_added / member_removed / invoice.refunded) → `AllowedEmail` +
ajuste de `Membership`. Tabela `HublaWebhookDelivery` para idempotência.
Sem acoplamento ao Neon do Orion.

## Alternativas
- Polling Orion — atrasado e acopla produtos.
- Só import CSV — ops manuais.

## Consequências
Hubla deve apontar webhook também para a URL do Club (ou duplicar destino).
Envs: `HUBLA_WEBHOOK_TOKEN`, `HUBLA_PRODUCT_ID` (legado=PRO),
`HUBLA_PRODUCT_ID_PRO`, `HUBLA_PRODUCT_ID_ELITE` (F053).
