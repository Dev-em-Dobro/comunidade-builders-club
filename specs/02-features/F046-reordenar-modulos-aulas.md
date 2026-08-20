# F046 — Reordenar módulos e aulas (admin)

## Status
Implementada — 2026-08-20

## Objetivo
Admin move módulos e aulas na ordem do catálogo (setas ↑/↓), usando
`sortOrder` já existente — sem precisar recriar itens.

## Comportamento
- Na tab Admin → Aulas: botões subir/descer por módulo e por aula.
- Troca `sortOrder` com o vizinho imediato (mesmo módulo, para aulas).
- Itens nas pontas não sobem/descem além do limite.
- Cache de aulas invalidado após mover.

## Critérios
- [x] Admin sobe/desce módulo e a ordem na listagem muda
- [x] Admin sobe/desce aula dentro do módulo
- [x] Membros veem a nova ordem (após cache/revalidate)
