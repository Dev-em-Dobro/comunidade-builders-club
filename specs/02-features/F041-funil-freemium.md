# F041 — Funil freemium (free vs paid)

## Status
Em Preview (homologação) — **não** mergear em `main` até validar.

## Contexto
Qualquer pessoa pode entrar no Builders Club como **free** (cadastro).
Conteúdo e interação completos ficam para **paid** (compra Hubla / allowlist).

## Tiers
| Tier | Quem |
|------|------|
| `free` | Login sem compra (ou após revogação Hubla) |
| `paid` | Allowlist, Hubla `member_added`, admin bootstrap |

`Membership.status` continua `active` para free e paid. `revoked` só em casos excepcionais (não no fluxo Hubla de cancelamento).

## Free pode (leitura)
- Feed (filtrado aos spaces liberados)
- Spaces: **Boas-vindas**, **Geral**, **Avisos**
- **Notificações**
- **Perfil**

## Free não pode (cadeado + popup upgrade)
- Outros Spaces, **Materiais**, **Aulas**, **Busca**
- Publicar, comentar, reagir, fixar, editar (interações)
- FAB Nova publicação

## Hubla
- `conceder` → `tier=paid` + `status=active` + allowlist
- `revogar` → `tier=free` (mantém `active`; admin não desce)

## UI
- Menus pagos com ícone de cadeado
- Clique em menu/ação bloqueada → modal “Comprar Builders Club”
- Checkout: `HUBLA_CHECKOUT_URL` (oferta Raphael — placeholder até existir)

## Critérios
- [x] Schema `Membership.tier`
- [x] Bootstrap free sem allowlist
- [x] Hubla paid / downgrade free
- [x] Gates server + UI
- [x] Preview only
