# F023 — Boas-vindas + Feed com duas vistas + modal

## Status
Implementado

## Objetivo
Aproximar a UX do Circle: espaço **Boas-vindas** com cards de
orientação (modal → reações/comentários/expandir) e **Feed** separado
com toggle entre visão reduzida (atual) e expandida.

## Critérios
- [x] Space `boas-vindas` no seed (topo da lista de Spaces)
- [x] `/` = Feed com todos os posts **exceto** Boas-vindas; toggle compacto/expandido
- [x] `/spaces/boas-vindas` = hero + tutorial Panda **na mesma
  largura dos cards** de orientação (não em largura total) + grade
  compacta abaixo/ao lado
- [x] Abaixo do hero: player Panda do tutorial da comunidade
  (`tutorial-intro-comunidade`), no mesmo grid dos cards (1 coluna),
  para não dominar a página. Cards de orientação compactos.
- [x] Clique no card abre modal com body, reações, expandir
- [x] Comentários **desativados** em Boas-vindas (orientação, não conversa)
- [x] No modal: “Expandir” abre o post na área de conteúdo (rota `/posts/[id]`, ao lado do aside)
- [x] Visão expandida do Feed mostra body (Markdown) + ações de reação no card
- [x] Preferência de vista do Feed persistida em `localStorage`
- [x] Primeiro acesso ao feed → Boas-vindas (F048)

## Fora de escopo
- Dark theme estilo Circle
- Calendário / ranking / gamificação

## Arquivos
- `src/components/welcome-space-view.tsx`, `post-modal.tsx`, `feed-list.tsx`, `post-detail-content.tsx`
- `src/actions/post-detail.ts`
- `prisma/seed.ts`, `src/lib/spaces/constants.ts` (tutorial Panda)
