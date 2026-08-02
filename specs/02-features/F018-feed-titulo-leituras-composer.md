# F018 — Feed compacto: título, leituras e composer no menu

## Status
Em implementação

## Objetivo
Feed mais escaneável: título gerado automaticamente, preview curto, contagem
de leitores únicos e publicação centralizada no menu lateral.

## Critérios
- [x] Ao criar post, `title` é gerado do body (1ª linha / trecho, sem Markdown)
- [x] Feed mostra título + snippet (~160 chars), não o body completo
- [x] Clique no card / título abre `/posts/[id]` com body completo
- [x] Contagem de **leitores únicos** (`PostView` por user+post); autor não conta
- [x] Contador visível no card e na página do post
- [x] Composer sai do feed; rota `/nova` (+ `?space=` opcional)
- [x] Menu lateral com CTA destacado “Nova publicação”

## Fora de escopo
- Título editável pelo autor (pode vir depois)
- Analytics avançado / heatmap
