# F113 — Aula 2 do Claude Code

## Status
Em implementação — 2026-10-15

## Objetivo

Segunda aula publicada no módulo raiz `claude-code` (F111). Pago
(`freeAccess` false). Ordem: aula 1 `claude-code-na-ide`, aula 2
`claude-code-na-pratica`.

## Conteúdo

| Campo | Valor |
|-------|-------|
| Módulo | `claude-code` |
| Aula | `claude-code-na-pratica` — Claude Code na prática |
| `sortOrder` | 1 |
| Panda library | `77c52f03-dc6` |
| Panda `video_external_id` | `600db079-fa56-4434-88ef-2be1f6a99e19` |
| Dashboard (não usar no embed) | `06854521-b018-4992-b497-9b7e91b781b0` |
| Materiais | `/materiais/claude-code-na-pratica-aula-2.zip`, `/materiais/tutorial-aula-2-claude-code.pdf` |

Descrição: aprofundar CLAUDE.md, pasta `.claude` e Plan Mode. ZIP do
projeto da aula + PDF tutorial.

O seed F111 **não** apaga mais a slug `claude-code-na-pratica` (era
limpeza de duplicata da aula 1).

## Seed

`scripts/seed-aulas-panda.mts` (CATALOG) +
`scripts/seed-f113-claude-code-aula-2.mts`. HML por padrão; produção com
`--target=prod --confirm`. ZIP e PDF precisam estar no deploy (`main`).

## Critérios

- [x] Aula 2 aparece depois de Claude Code na IDE, no mesmo módulo
- [x] Descrição + ZIP + PDF visíveis na aula
- [x] `freeAccess` permanece `false`
- [x] Embed usa `video_external_id`, não o UUID do dashboard
