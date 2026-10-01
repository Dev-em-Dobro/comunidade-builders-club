# F103 — Gravações das Lives Semanais

## Status
Em implementação — 2026-09-30

## Objetivo

Novo módulo raiz no catálogo `/aulas`: **Gravações das Lives Semanais**.
Primeira aula: a live **RaaS — Como cobrar pelo resultado do cliente**.

A gravação da live é benefício de **membro pagante** (PRO e Elite).
Free vê o card com cadeado (F072); não assiste. `freeAccess` permanece
`false` (default). Não marcar a raiz nem a aula.

## Acesso

| Tier | Catálogo | Player |
|------|----------|--------|
| Free | vê o card, capa cinza + cadeado | `canWatchLesson` recusa → `AULAS_FREE_HREF` (F065) |
| PRO / Elite / staff | abre e assiste | qualquer aula `published` da árvore |

A live ao vivo de terça continua regra da oferta Elite (F079). Esta
feature é o **arquivo** das gravações, aberto a pagantes — alinhado à
F102: “gravação é benefício de aluno pagante”.

## Catálogo

Raiz `parentId` null, depois de Fundamentos (`sortOrder` 12). Capa
genérica 16:9 em `/5-lives-semanais.png` (mesma série 3D das outras;
não usar a thumb do vídeo — aparece o apresentador).

```
Gravações das Lives Semanais          ← raiz, pago
└── RaaS — Como cobrar pelo resultado do cliente
```

Próximas lives entram como novas aulas neste módulo (seed + publish),
não como módulos raiz.

## Aula 1

| Campo | Valor |
|-------|--------|
| Módulo | `gravacoes-das-lives-semanais` |
| Slug | `raas-como-cobrar-pelo-resultado-do-cliente` |
| Título | RaaS — Como cobrar pelo resultado do cliente |
| Panda `video_external_id` | `fe436016-92cc-487e-986e-651d31e79fcb` |
| Library | `77c52f03-dc6` |
| Pasta Panda | `d5fa2de0-ae46-4967-be9c-41466511e796` |
| Dashboard (não usar no embed) | `e7856075-8636-40f4-87c5-459a3e2f6506` |

Descrição no seed e em `aulas-descricoes-data.mts`.

## Seed

`scripts/seed-aulas-panda.mts` — idempotente por slug. `forceLessonSort`
neste módulo para as lives novas manterem a ordem do seed. HML por
padrão; produção com `--target=prod --confirm`. Publicar a árvore com
`publish-jornada-hml.mts --slugs=gravacoes-das-lives-semanais`.

## Critérios

- [x] `/aulas` mostra o 5º card **Gravações das Lives Semanais** (HML)
- [x] Clique abre o player da aula RaaS
- [x] `freeAccess` é `false`; free não assiste
- [x] Embed usa `video_external_id`, não o UUID do dashboard
