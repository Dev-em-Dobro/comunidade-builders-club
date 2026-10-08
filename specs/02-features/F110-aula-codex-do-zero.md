# F110 — Primeira aula do Codex

## Status
Em implementação — 2026-10-08

## Objetivo

O módulo raiz `codex` (F108) sai de **Em breve**: primeira aula
publicada, descrição do card sem “Em breve no Club”, capa genérica 3D
(`/6-codex.png`) para o card não cair na thumb do vídeo.

Pago (`freeAccess` false). Badge F108 some sozinho quando
`contentCount > 0`.

## Aula

| Campo | Valor |
|-------|--------|
| Módulo | `codex` |
| Slug | `codex-do-zero-chatgpt-desktop` |
| Título | Codex do zero (ChatGPT Desktop) |
| Panda `video_external_id` | `64ee35dc-5959-4d63-b8c2-b8f711da86da` |
| Library | `77c52f03-dc6` |
| Dashboard (não usar no embed) | `5015bc08-682b-46ca-bfc5-c2965637bdf6` |

Descrição no seed e em `aulas-descricoes-data.mts`.

Descrição do módulo (sem “Em breve no Club”):

> Agente da OpenAI: instalação, AGENTS.md, plugins e uso no dia a dia.

## Seed

`scripts/seed-aulas-panda.mts` (CATALOG) +
`scripts/seed-f110-codex-aula.mts` (só este módulo). HML por padrão;
produção com `--target=prod --confirm`.

`scripts/seed-f108-modulos-em-breve.mts` não devolve a copy “Em breve”
no Codex.

## Critérios

- [x] Card Codex em `/aulas` sem badge Em breve (HML + prod)
- [x] Clique abre o player da aula
- [x] `freeAccess` continua `false`
- [x] Embed usa `video_external_id`, não o UUID do dashboard
