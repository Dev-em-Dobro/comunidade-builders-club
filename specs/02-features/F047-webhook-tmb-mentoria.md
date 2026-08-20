# F047 — Webhook TMB (Mentoria Freela) → allowlist + paid

## Status
Implementada — 2026-08-20

## Objetivo
Receber o webhook de **vendas** da TMB e liberar acesso full no Builders Club
para as ofertas da Mentoria Freela — espelhando o padrão Hubla (F014), sem
escrever no banco via n8n.

**Fora de escopo:** DevQuest (sazonal → seed/CLI `db:seed:devquest`).

## Endpoint
`POST /api/webhooks/tmb` — público.

Auth: header configurável = `TMB_WEBHOOK_TOKEN`.
- Default do header: `x-tmb-token`
- Na UI TMB: **Chave** = nome do header (ex. `x-tmb-token`), **Valor** = o token
- Override: `TMB_WEBHOOK_HEADER`

## Ofertas liberadas (codes do checkout)
| Code | Checkout |
|------|----------|
| `1AS249898VN` | pay.tmb.com.br/DevemDobro/1AS249898VN |
| `3XB272209KV` | pay.tmb.com.br/DevemDobro/3XB272209KV |
| `9DW254247E5` | pay.tmb.com.br/DevemDobro/9DW254247E5 |

Override: `TMB_PRODUCT_CODES` (CSV). Filtro opcional: `TMB_LANCAMENTO_ID=36238`.

## Campos do payload (mínimo)
`email`, `code`, `pedido`/`id`, `status_pedido`, `status_financeiro`,
`cliente`, `lancamento_id` (opcional).

## Regras
| Condição | Ação |
|----------|------|
| `status_pedido=Efetivado` **e** `status_financeiro=Adimplente` **e** `code` na lista | `AllowedEmail` source=`tmb` + Membership `active`/`paid` |
| `status_pedido` ∈ cancelado/estornado **ou** `status_financeiro=Inadimplente` | remove allowlist + `tier=free` (não revoga login; admin intacto) |
| Demais / code fora da lista / e-mail inválido | ignora (200) |

Idempotência: chave `tmb:{pedido}:{status_pedido}:{status_financeiro}` em
`HublaWebhookDelivery` (tabela genérica de deliveries).

## Critérios
- [x] Token ausente/inválido → 401; env não configurada → 503
- [x] Grant Mentoria → allowlist + paid
- [x] Code DevQuest/outro → ignorado
- [x] Revoke financeiro/pedido → free
- [x] Duplicata → 200 no-op
