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
| `customer.member_added` | Upsert `AllowedEmail` (source=hubla); se User `pending` → `active` |
| `customer.member_removed` | Remove allowlist; se membership `active` → `revoked` |
| `invoice.refunded` | Idem revogar |

Filtro opcional `HUBLA_PRODUCT_ID`. Idempotência: `x-hubla-idempotency` → `HublaWebhookDelivery`.

## Critérios
- [x] Token inválido / ausente → 401
- [x] Token não configurado → 503
- [x] member_added → e-mail na allowlist; pending vira active
- [x] member_removed → revoga membership existente
- [x] Idempotency duplicada → 200 no-op
