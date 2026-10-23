# F112 — Primeira aula do Grok Bots

## Status
Em implementação — 2026-10-13

## Objetivo

O módulo raiz `grok-bots-agentes-que-fazem-trabalho-por-voce` (F107)
sai de **Em breve**: primeira aula publicada, capa genérica
(`/8-grok-bots.png`) para o card não cair na thumb do vídeo.

Pago (`freeAccess` false). Badge F108 some sozinho quando
`contentCount > 0`.

Ordem no catálogo: Gravações → Claude Code → Codex → **Grok Bots** →
JEV (`sortOrder` 15).

## Conteúdo

| Campo | Valor |
|-------|-------|
| Módulo | `grok-bots-agentes-que-fazem-trabalho-por-voce` |
| Aula | `grok-bots-na-pratica` — Grok Bots na prática |
| Panda library | `77c52f03-dc6` |
| Panda `video_external_id` | `b1661728-611f-4519-9484-9ce269163dcf` |
| Dashboard (não usar no embed) | `e3b7ba95-3d96-4e89-8d20-fa7de1a51070` |
| Capa do módulo | `/8-grok-bots.png` |
| Material | `/materiais/grok-bots-na-pratica.pdf` |

A descrição resume a live: montar o Emaildo – Recepção (bot que lê e-mail,
etiqueta e rascunha; a pessoa aprova), anti-jobs, Gmail, rotina, skill,
bot revisor e segurança. O PDF da aula entra como anexo (capítulos,
prompts e FAQ fictício).

## Seed

`scripts/seed-aulas-panda.mts` (CATALOG) +
`scripts/seed-f112-grok-aula.mts`. HML por padrão; produção com
`--target=prod --confirm`.

Capa `/8-grok-bots.png` e o PDF precisam estar no deploy (`main` em
produção). Se a capa 404, o card cai no gradiente com o título.

## Critérios

- [x] Card Grok Bots em `/aulas` sem badge Em breve (HML + prod)
- [x] Aula abre o vídeo Panda e mostra descrição + PDF
- [x] `freeAccess` permanece `false`
- [x] Embed usa `video_external_id`, não o UUID do dashboard
