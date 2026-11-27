# F047 — Webhook TMB (Mentoria Freela) → allowlist + paid

## Status
Implementada — 2026-08-20

## Objetivo
Receber o webhook de **vendas** da TMB e liberar acesso full no Builders Club
para as ofertas da Mentoria Freela — espelhando o padrão Hubla (F014), sem
escrever no banco via n8n.

A oferta base TMB Black Infinita 2026 `ZBS345545R7` concede Elite vitalício. As demais ofertas do mesmo produto continuam fora dessa regra.

## Endpoint
`POST /api/webhooks/tmb` — público.

Auth: header configurável = `TMB_WEBHOOK_TOKEN`.
- Default do header: `x-tmb-token`
- Na UI TMB: **Chave** = nome do header (ex. `x-tmb-token`), **Valor** = o token
- Override: `TMB_WEBHOOK_HEADER`

## Ofertas liberadas (codes do checkout)
| Code | Checkout | Tier |
|------|----------|------|
| `1AS249898VN` | pay.tmb.com.br/DevemDobro/1AS249898VN | **pro** (Mentoria) |
| `3XB272209KV` | pay.tmb.com.br/DevemDobro/3XB272209KV | **elite** (boleto Elite, F053) |
| `9DW254247E5` | pay.tmb.com.br/DevemDobro/9DW254247E5 | **elite** (boleto Elite, F053) |
| `ZBS345545R7` | pay.tmb.com.br/DevemDobro/ZBS345545R7 | **elite vitalício** (Black Infinita 2026) |

Override: `TMB_PRODUCT_CODES` (CSV). Codes Elite: `TMB_ELITE_CODES` (default
`3XB272209KV,9DW254247E5`). A oferta Black entra mesmo com overrides e ignora o filtro opcional `TMB_LANCAMENTO_ID`, específico da Mentoria.

## Campos do payload (mínimo)
`email`, `code`, `pedido`/`id`, `status_pedido`, `status_financeiro`,
`cliente`, `lancamento_id` (opcional).

## Regras
| Condição | Ação |
|----------|------|
| `status_pedido=Efetivado` **e** `status_financeiro=Adimplente` **e** `code` na lista | `AllowedEmail` source=`tmb` + Membership `active` / `pro` ou `elite` conforme o code. Quem já é **free** (F059) sobe o plano; origem do cadastro **não** muda. Lookup de User case-insensitive. |
| `status_pedido` ∈ cancelado/estornado **ou** `status_financeiro=Inadimplente` | remove allowlist + `tier=free` (não revoga login; admin intacto) |
| Demais / code fora da lista / e-mail inválido | ignora (200) |
| `ZBS345545R7` com pagamento confirmado | Elite + `vitalicio=true`; preserva no reenvio |
| Revoke de membro vitalício | mantém allowlist e Elite vitalício |

Idempotência: chave `tmb:{pedido}:{status_pedido}:{status_financeiro}` em
`HublaWebhookDelivery` (tabela genérica de deliveries).

## Critérios
- [x] Token ausente/inválido → 401; env não configurada → 503
- [x] Grant Mentoria → allowlist + paid
- [x] Code DevQuest/outro → ignorado
- [x] Revoke financeiro/pedido → free
- [x] Duplicata → 200 no-op
