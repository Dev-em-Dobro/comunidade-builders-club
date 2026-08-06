# F034 — Feed: posts fixados no topo

## Status
Implementado

## Critérios
- [x] Posts com `pinnedAt` sempre acima dos demais no feed/spaces
- [x] Entre fixados (e entre não-fixados), ordem por `createdAt` desc
- [x] Postgres: `nulls: last` em `pinnedAt` (evita NULL subir no `DESC`)
