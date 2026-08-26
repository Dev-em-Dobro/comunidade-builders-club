# F041 — Funil freemium (free vs paid)

## Status
**Em produção** desde 16/08/2026 — homologado no Preview com conta free e
mergeado em `main` (PR #2).

Planos pagos PRO/Elite e checkout oficial: [F053](F053-ofertas-pro-elite.md)
(2026-08-23). `paid` legado = PRO. **Avisos** deixou de ser space free.

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
- **Abrir e ler qualquer post do feed**, inclusive de space pago — post
  completo, mídia e comentários
- Spaces: **Boas-vindas**, **Geral**, **Presentes** (F059 — catálogo logado;
  sem isso o cadastro pelo Instagram cai em cadeado no que foi prometido).
  Avisos é PRO+ desde F053.
- **Notificações**
- **Perfil**

### Por que o feed é aberto
O feed é a vitrine do produto: as vitórias e resultados dos alunos são postados
em spaces pagos (ex.: **Conquistas**, **Desafio Projetos**). Esconder esses posts do free
tira justamente a prova social que motiva o upgrade. Free **lê**; o que converte
é **participar** — comentar, reagir, publicar, navegar os spaces.

## Free não pode (cadeado + popup upgrade)
- Outros Spaces (a *página* do space), **Materiais**, **Aulas**, **Busca**
- Publicar, comentar, reagir, fixar, editar (interações)
- FAB Nova publicação
- Threads de aula (`aula-threads`) — conteúdo pago, nunca aparece no feed

## Leitura de post — regra
| Space do post | Free abre `/posts/[id]`? |
|---------------|--------------------------|
| qualquer space do feed (`geral`, `avisos`, `conquistas`, `projetos`, …) | sim |
| `aula-threads` | não → `/planos` |

No detalhe do post, o link de volta aponta para o space quando free tem acesso a
ele; caso contrário volta para o **Feed** (evita cair no redirect de upgrade).
Gate de `/spaces/[slug]` continua igual: space pago redireciona free para
`/planos`. Links antigos `/?upgrade=1` redirecionam para `/planos`.

## Hubla
- `conceder` → `tier=paid` + `status=active` + allowlist
- `revogar` → `tier=free` (mantém `active`; admin não desce)

## UI
- Menus pagos com ícone de cadeado
- Clique em menu/ação bloqueada → modal com CTA **Ver planos** → `/planos`
- Checkout das duas ofertas oficiais na página `/planos` — ver F053
  (`HUBLA_CHECKOUT_URL_PRO` / `HUBLA_CHECKOUT_URL_ELITE`)

## Critérios
- [x] Schema `Membership.tier`
- [x] Bootstrap free sem allowlist
- [x] Hubla paid / downgrade free
- [x] Gates server + UI
- [x] Preview only
- [x] Feed do free lista posts de todos os spaces visíveis
- [x] Free abre o detalhe de qualquer post do feed (só `aula-threads` barrado)
- [x] Interações no post seguem bloqueadas para free
