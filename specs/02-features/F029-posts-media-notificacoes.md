# F029 — Posts: mídia, permissões, comentários e notificações

## Status
Implementado

## Objetivo
Corrigir UX de posts/comentários/notificações e endurecer upload de mídia.

## Critérios
- [x] Space **boas-vindas**: apenas admin publica (FAB/`/nova` + server)
- [x] Comentário atualiza a lista imediatamente (refresh / reload do modal)
- [x] Sininho faz polling; opcional notificação do navegador (Windows/Chrome)
- [x] Upload de arquivo (jpg/png/gif ≤1 MB; mp4 ≤50 MB) via Blob / fallback local
- [x] Link sanitizado `https://` anexado ao post (`linkUrl`) e exibido
- [x] Autolink de URLs http(s) no body (ex.: GitHub)
- [x] `cursor-pointer` em controles clicáveis (notificações, toggle do feed, base)
- [x] Autor (não-admin) edita e remove o próprio post
