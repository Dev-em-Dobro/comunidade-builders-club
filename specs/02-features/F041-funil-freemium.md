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
- **Feed completo** — mesma timeline do paid (exclui só `boas-vindas` e
  `aula-threads`, que ficam fora do feed para todos os tiers)
- Spaces: **Boas-vindas**, **Geral**, **Avisos**
- **Notificações**
- **Perfil**

### Por que o feed é aberto
O feed é a vitrine do produto: as vitórias e resultados dos alunos são postados
em spaces pagos (ex.: **Conquistas**, **Projetos**). Esconder esses posts do free
tira justamente a prova social que motiva o upgrade. O free **lê o card** no
feed; o aprofundamento (post completo, comentários, space) exige upgrade.

## Free não pode (cadeado + popup upgrade)
- Abrir o **detalhe** de post de space pago (card do feed → modal de upgrade)
- Outros Spaces, **Materiais**, **Aulas**, **Busca**
- Publicar, comentar, reagir, fixar, editar (interações)
- FAB Nova publicação

## Feed do free — regra do card
| Post em space | Card no feed | Clique no card |
|---------------|--------------|----------------|
| `geral`, `avisos` | normal | abre `/posts/[id]` |
| demais spaces | normal + selo **Membros** | abre modal de upgrade (`reason: space`) |

Gate de servidor continua valendo: `/posts/[id]` e `/spaces/[slug]` de space pago
redirecionam free para `/?upgrade=1` (defesa em profundidade — o card só evita a
navegação inútil).

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
- [x] Feed do free lista posts de todos os spaces visíveis
- [x] Card de space pago no feed do free tem selo e abre modal de upgrade
