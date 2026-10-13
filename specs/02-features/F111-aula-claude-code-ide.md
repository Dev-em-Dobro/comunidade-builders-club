# F111 — Primeira aula do Claude Code

## Status
Em implementação — 2026-10-13

## Objetivo

O módulo raiz `claude-code` (F108) sai de **Em breve**: primeira aula
publicada, descrição do card sem “Em breve no Club”, capa genérica
(`/7-claude-code.webp`) para o card não cair na thumb do vídeo.

Pago (`freeAccess` false). Badge F108 some sozinho quando
`contentCount > 0`.

Ordem no catálogo: Gravações → Codex → **Claude Code** → Grok Bots →
JEV (`sortOrder` 14).

## Conteúdo

| Campo | Valor |
|-------|-------|
| Módulo | `claude-code` |
| Aula | `claude-code-na-ide` — Claude Code na IDE |
| Panda library | `77c52f03-dc6` |
| Panda `video_external_id` | `3ec9d2a0-d36f-4c43-b652-1d0e57f10f18` |
| Dashboard (não usar no embed) | `31eddebf-a146-4ed7-8a2f-a33172ecba53` |
| Capa do módulo | `/7-claude-code.webp` |
| Material | `/materiais/claude-code-print-lp.zip` |

A descrição explica instalação e uso na IDE, informa que Claude Code requer
Claude Pro e que as técnicas de desenvolvimento e revisão também servem para
outras IAs. Inclui o guia da aula e o download do ZIP.

## Seed

`scripts/seed-aulas-panda.mts` (CATALOG) +
`scripts/seed-f111-claude-code-aula.mts`. HML por padrão; produção com
`--target=prod --confirm`. Remove a slug duplicada `claude-code-na-pratica`
se existir.

## Critérios

- [x] Card Claude Code imediatamente depois do Codex, sem “Em breve”
- [x] Aula abre o vídeo Panda e mostra guia, descrição e ZIP
- [x] `freeAccess` permanece `false`
- [x] Embed usa `video_external_id`, não o UUID do dashboard
