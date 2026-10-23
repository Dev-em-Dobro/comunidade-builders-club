# F116 — Módulo Criando um site premium

## Status
Em implementação — 2026-10-22

## Objetivo

Módulo raiz novo no catálogo `/aulas` da comunidade, pago (`freeAccess`
false), com capa genérica e a primeira aula publicada. O DevQuest fica
fora desta feature.

## Conteúdo

| Campo | Valor |
|-------|-------|
| Módulo | `criando-um-site-premium` — Criando um site premium |
| `sortOrder` | 16 (JEV vai para 17, permanece Em breve) |
| Capa | `/9-site-premium.png` |
| Aula | `criando-um-site-premium` — Criando um site premium |
| Panda library | `77c52f03-dc6` |
| Panda `video_external_id` | `15e6afe9-633e-4d15-b960-e81a426a4402` |
| Dashboard (não usar no embed) | `d1c42867-3af3-4527-8a4b-d297b7510a4b` |
| PDF | `/materiais/guia-passo-a-passo-aluno.pdf` |
| ZIP | Drive `16N--KGFcfjbIYqKbO1nG4lOIIBpD24hX` (~209 MB; não versionar) |

A descrição aponta o guia passo a passo (site de relógio com animação no
scroll) e o ZIP do site pronto.

## Seed

`scripts/seed-aulas-panda.mts` (CATALOG) +
`scripts/seed-f116-site-premium.mts`. HML por padrão; produção com
`--target=prod --confirm`. Capa e PDF precisam estar no deploy (`main`).

## Critérios

- [x] Card no catálogo com capa, sem Em breve
- [x] Aula publicada com vídeo Panda, PDF e ZIP na descrição
- [x] `freeAccess` permanece `false`
- [x] Embed usa `video_external_id`, não o UUID do dashboard
