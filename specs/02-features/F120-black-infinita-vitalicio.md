# F120 — Black Infinita 2026: acesso vitalício no Club

## Status
Em implementação — 2026-10-26

## Contexto

Campanha **Black Infinita 2026**. Três checkouts Hubla concedem acesso
**permanente** à comunidade (tag **Vitalício** no perfil), distinto de PRO/Elite
cancelláveis. No Orion, a mesma compra dispara só a **cortesia Pro de 90 dias**
(F042) — o Orion não fica vitalício.

## Ofertas Hubla (`offers[].id` = slug pay.hub.la)

| Checkout | Offer id | Preço |
|----------|----------|-------|
| Black alunos 2025 | `YKPMuMwSBhPBb7UUuDlX` | R$ 597 |
| Black alunos | `NZKc6aZXwbD4ihw9vvPN` | R$ 797 |
| Black não alunos | `6njIGlJgossHQysj6WA7` | R$ 997 |

Produto Club continua `HUBLA_PRODUCT_ID` / `VL3e0iDO3A32SyjJWr9S` para PRO/Elite
normais. Black Infinita roda no produto Hubla **DevQuest 2.0 - Black Friday**:

| Campo | Valor |
|-------|-------|
| Product catalog id | `hXQcK8O5fZGvRK4RVMxJ` |
| Discriminador | `offers[].id` (os 3 links acima) |

### Quirk Hubla (sandbox/prod)

Em vários eventos Black, `event.product.id` vem **igual ao offer id** (slug
pay.hub.la), enquanto o produto de catálogo fica em `event.products[0].id` =
`hXQcK8O5fZGvRK4RVMxJ`. O interpretador precisa:

1. Aceitar o product catalog `hXQc…` **e** offer ids Black como chaves de produto
2. Continuar discriminando pelo `offers[].id` / pelo próprio `product.id` quando
   ele for um offer Black

## Comportamento

| Campo | Valor no grant |
|-------|----------------|
| `Membership.tier` | `elite` (mesmo pacote de capacidades do Elite) |
| `Membership.vitalicio` | `true` |
| `Membership.vitalicioOfferId` | offer id da compra (1ª vez; não sobrescreve) |
| `Membership.vitalicioGrantedAt` | agora (1ª vez) |
| Allowlist `note` | inclui `plan=elite; vitalicio=1` |

### Revoke Hubla (`member_removed` / `invoice.refunded`)

Se `vitalicio === true`: **não** remove allowlist e **não** desce para `free`.
Chargeback/ops manual continua possível via admin (fora deste escopo).

### UI

`PlanBadge` no perfil, configurações e menu do usuário: se `vitalicio`, mostra
**Vitalício** (não “Elite” genérico), para diferenciar de alunos comuns.

### Bootstrap / 1º login

`tierPagoDaNotaAllowlist` e flag `vitalicioDaNotaAllowlist` leem `vitalicio=1`
e/ou offer id Black na `note`, para conta criada **depois** do webhook.

## Env (opcional)

`HUBLA_OFFER_ID_VITALICIO` — CSV extra além dos três oficiais hardcoded.

## Critérios

- [x] Compra de qualquer um dos 3 links → Club `elite` + `vitalicio=true` + badge Vitalício
- [x] Revoke Hubla **não** tira acesso vitalício
- [x] Compra Elite/PRO normal continua cancellável (sem flag)
- [x] Offer id Black desconhecido sem mapa → não concede elite por engano via product.id só
- [x] Testes unitários do mapa / nota allowlist

## Fora de escopo

- Orion vitalício (é trial 90d — F042)
- UI de `/planos` com cards Black (campanha externa)
- Admin “revogar vitalício”
