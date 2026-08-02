# F015 — Comunidade 2.0 (replies, menções, Markdown)

## Status
Em implementação

## Objetivo
Engajamento mais rico no feed: respostas aninhadas, @menções e Markdown seguro.

## Critérios
- [x] Comentário pode ter `parentId` (1 nível de reply sob comentário raiz)
- [x] Reply notifica o autor do comentário pai (`reply_on_comment`)
- [x] `@Nome` no body de post/comentário resolve para membros ativos e notifica (`mention_in_post` / `mention_in_comment`)
- [x] Body renderizado com Markdown seguro (negrito, itálico, código, links, listas, quebras)
- [x] Composer e formulário de comentário documentam atalhos básicos

## Fora de escopo
- Nested replies > 1 nível
- Upload de arquivos / editor WYSIWYG
- Realtime
