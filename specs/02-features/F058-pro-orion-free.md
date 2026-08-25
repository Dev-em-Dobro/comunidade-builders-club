# F058 — PRO inclui Orion no plano Free

## Status
Em implementação — 2026-08-25

## Objetivo
Quem compra o **PRO** do Club (R$ 297 / Mentoria TMB) passa a ter **acesso
ao Orion no plano Free** (teto de 40 Leads/mês). O card em `/planos` diz
isso. Elite continua com Orion **além** do Free (cortesia Pro de 90 dias
enquanto o Orion estiver em `trial-pro-*` — [F035](../../../specs/02-features/F035-planos-e-limites.md)
do Orion).

Até esta feature, o clique em Orion no PRO ia para `/planos?destaque=elite`
e o webhook do Orion **ignorava** o produto PRO. A copy mentia se
atualizássemos o card sem o grant.

## Club

- Card PRO: linha **Orion (plano Free)**.
- Sidebar: PRO e Elite abrem o Orion (mesmo `ORION_APP_URL`). Free continua
  com cadeado → `/planos` (motivo orion, sem forçar destaque Elite).
- `/planos`: PRO também vê **Abrir Orion**. Copy de quem já é PRO não diz
  mais que Elite é o único caminho para o app.
- Modal: “Orion entra no PRO (plano Free) e no Elite”.

Emenda da [F053](F053-ofertas-pro-elite.md).

## Orion (banco separado)

Emendas [F019](../../../specs/02-features/F019-webhook-hubla.md),
[F019.1](../../../specs/02-features/F019.1-ativacao-acesso.md),
[F041](../../../specs/02-features/F041-webhook-tmb.md).

- `HUBLA_OFFER_ID_PRO` = `products[].offers[].id` do PRO R$ 297 no produto
  Club (`VL3e0iDO3A32SyjJWr9S`). **Não** é o slug de checkout
  (`XaY8QNfZlOO1XBgjzMfY`) nem `HUBLA_PRODUCT_ID_PRO` (plano Pro do Orion /
  `trial-pro-*`). `HUBLA_PRODUCT_ID_CLUB_PRO` só se a Hubla criar produto
  separado.
- TMB Mentoria `1AS249898VN` grava entitlement de **acesso** (Free).
- Cortesia Pro **não** dispara nesses grants — só Elite (legado / Elite Hubla
  / boleto `3XB` e `9DW`).

Quem já comprou PRO **antes** desta env: o evento antigo foi ignorado, não
há linha. Precisa replay do webhook Hubla/TMB ou entitlement manual. Compra
nova após a env gravar sozinha.

## Critérios

- [x] Spec antes do código
- [x] Card PRO lista Orion plano Free
- [x] Sidebar PRO abre o Orion; Free segue bloqueado
- [x] Webhook Orion concede acesso na oferta PRO (`HUBLA_OFFER_ID_PRO`) e na Mentoria TMB
- [x] Esses grants **não** criam cortesia `trial-pro-*`
- [x] Elite inalterado (acesso + cortesia Pro)
