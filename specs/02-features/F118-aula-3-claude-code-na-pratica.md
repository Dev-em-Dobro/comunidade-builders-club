# F118 — Aula 3 do Claude Code

## Status
Em implementação — 2026-10-22

## Objetivo

Terceira aula no módulo raiz `claude-code`. Pago (`freeAccess` false).
Ordem: aula 1 `claude-code-na-ide`, aula 2 `claude-code-na-pratica`,
aula 3 `claude-code-na-pratica-aula-3`. DevQuest fica fora.

## Conteúdo

| Campo | Valor |
|-------|-------|
| Módulo | `claude-code` |
| Aula | `claude-code-na-pratica-aula-3` — Claude Code na prática: gerador de orçamentos |
| `sortOrder` | 2 |
| Panda library | `77c52f03-dc6` |
| Panda `video_external_id` | `7f45c2b4-ae66-47d3-974f-cd232eecaccf` |
| Dashboard (não usar no embed) | `4c5f7db0-8167-4de6-8b3b-7df8e9e063bf` |
| Material | `/materiais/claude-code-na-pratica-aula-3.zip` |

Projeto da aula: gerador de orçamentos e propostas por link (Next.js +
Supabase), a partir do [repositório público](https://github.com/devemdobro/gerador-de-orcamento).

## Seed

`scripts/seed-aulas-panda.mts` (CATALOG) +
`scripts/seed-f118-claude-code-aula-3.mts`. HML por padrão; produção com
`--target=prod --confirm`. ZIP precisa estar no deploy (`main`).

## Critérios

- [ ] Aula 3 aparece depois da aula 2 no módulo Claude Code
- [ ] Descrição + ZIP visíveis na aula
- [ ] `freeAccess` permanece `false`
- [ ] Embed usa `video_external_id`, não o UUID do dashboard
