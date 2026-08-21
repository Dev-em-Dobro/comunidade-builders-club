# F027 — Skeletons de navegação + performance

## Status
Implementado

## Objetivo
Feedback visual ao clicar links (skeleton) e reduzir tempo de carga
(layout compartilhado, auth cacheado, queries mais leves).

## Critérios
- [x] `(app)/layout.tsx` com AppShell estável; `loading.tsx` com skeleton
- [x] `requireActiveMember` com `React.cache` + bootstrap fast-path
- [x] AppShell não refetch de avatar; reactions no feed só do viewer
- [x] `recordPostView` não bloqueia HTML do post
- [x] Remover `force-dynamic` desnecessário em listagem de entregáveis
- [x] Sidebar de Spaces: não substituir a lista hidratada por `[]` no
  `router.refresh()` do admin (o shell SSR manda array vazio de propósito)

## Análise (resumo)
Antes: cada navegação refazia auth + dados + shell (spaces/notifs/avatar) com tela congelada.
Depois: shell no layout; skeleton no miolo; auth deduplicado; bootstrap short-circuit; feed com menos reactions.
