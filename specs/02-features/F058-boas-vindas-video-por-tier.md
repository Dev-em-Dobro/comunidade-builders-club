# F058 — Vídeo de boas-vindas por plano (free vs paid)

## Status
Em implementação

## Objetivo
No space **Boas-vindas**, o tutorial Panda (layout F023/F055) muda conforme
o plano: **gratuito** e **pago** assistem a vídeos distintos.

Complementa F055 (trilha) e F041 (tiers). O embed segue ADR-005 e a
validação de IDs de F011/F021 (`pandaEmbedUrl`).

## Comportamento
| Plano | Vídeo Panda (`externalId`) |
|-------|----------------------------|
| `free` | `4b3178aa-9fb0-46df-b988-8f3c76e6ab40` |
| `paid` (e admin/instructor) | `d3b5019d-49b8-479e-a150-7ea654dc7cf6` |

Library (pullzone, sem prefixo `vz-`): `77c52f03-dc6`.

O vídeo do free foi regravado em 31/08/2026 (pendência da
[F063](F063-funil-presente-conta-free.md)); o anterior era
`79a1c579-1870-48bb-8bf7-5f16f0c1ec91`. A capa da F068 não muda: ela é a
mesma para os dois planos.

Regra de plano: a mesma de F041 (`isPaidMembership`). Admin e instructor
veem o vídeo pago mesmo com `tier=free`.

Layout do space (player + card Primeiros passos) permanece o de F055.
Só a `src` do iframe muda.

## Critérios
- [x] Free vê o embed do vídeo gratuito
- [x] Paid (e admin/instructor) vê o embed do vídeo pago
- [x] Player continua responsivo (16:9), `allowfullscreen`, IDs validados via `pandaEmbedUrl`
- [x] Um único iframe por visita (sem duplicar o player)

## Fora de escopo
- Admin para trocar os IDs (constantes no código)
- Trilha de Primeiros passos diferente por plano
- Trocar o vídeo da aula “Como usar a comunidade” — feito em [F060](F060-aula-desafio-quick-win.md) (vídeo pago)
- Progresso / conclusão do tutorial
