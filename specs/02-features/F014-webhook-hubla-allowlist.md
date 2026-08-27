# F014 — Webhook Hubla → allowlist

## Status
Implementada — 2026-08-02 · ADR-006

## Objetivo
Receber eventos Hubla e manter `AllowedEmail` + membership sem import manual.
Padrão espelhado do Orion F019, adaptado ao Club (sem SSO).

## Endpoint
`POST /api/webhooks/hubla` — público. Auth: header `x-hubla-token` = `HUBLA_WEBHOOK_TOKEN`.

## Eventos
| Tipo | Efeito |
|------|--------|
| `customer.member_added` | Upsert allowlist + sobe o plano (PRO/Elite) |
| `invoice.payment_succeeded` | Idem — pagamento da fatura (F059: free que já tem conta) |
| `subscription.activated` | Idem — assinatura ativada |
| `customer.member_removed` | Remove allowlist; membership pago → `tier=free` (continua active) |
| `invoice.refunded` | Idem revogar |

`member_added` com assinatura **cancelada / unpaid / refunded** é ignorado.
Venda avulsa (`completed` ou **sem** status) **não** é bloqueada.

Quem já é **free** (cadastro pelo presente, F059) sobe o `tier` **sem** apagar
`originUtmContent` / `originGiftSlug` / `originAt`.

Lookup do User: e-mail em minúsculo, case-insensitive; tenta todos os e-mails
do payload (user, pagador da assinatura, pagador da fatura).

Filtro: produto Club + ofertas (F053). `HUBLA_PRODUCT_ID` (product.id),
`HUBLA_OFFER_ID_PRO` / `HUBLA_OFFER_ID_ELITE` (offers[].id no mesmo produto),
`HUBLA_PRODUCT_ID_PRO` / `HUBLA_PRODUCT_ID_ELITE` (produto separado, se
existir). Sem nenhum product id e sem nenhum offer id → 503.
Idempotência: `x-hubla-idempotency` → `HublaWebhookDelivery`.

## Critérios
- [x] Token inválido / ausente → 401
- [x] Token não configurado → 503
- [x] member_added → e-mail na allowlist; pending vira active
- [x] `invoice.payment_succeeded` e `subscription.activated` também concedem
- [x] Free já cadastrado sobe PRO/Elite; origem do presente **não** muda
- [x] member_removed → desce para free (não revoga o login)
- [x] Idempotency duplicada → 200 no-op
