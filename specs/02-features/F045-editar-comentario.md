# F045 — Editar comentário

## Status
Implementada — 2026-08-20

## Objetivo
Autor (ou admin) pode editar o texto de um comentário/resposta, no post e
na discussão de aula.

## Comportamento
- Botão “Editar” no comentário se `isAuthor || isAdmin`.
- Atualiza só `body` (max 5000); `updatedAt` via Prisma.
- Remover continua só admin (comportamento atual).
- Sem re-disparo de notificação na edição.

## Critérios
- [x] Autor edita o próprio comentário
- [x] Admin edita qualquer comentário
- [x] Não-autor/não-admin não edita
- [x] Funciona em post e em comentários de aula
