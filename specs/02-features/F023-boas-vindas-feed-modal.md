# F023 — Boas-vindas + Feed com duas vistas + modal

## Status
Implementado

## Objetivo
Aproximar a UX do Circle: espaço **Boas-vindas** (tutorial + trilha) e
**Feed** separado com toggle entre visão reduzida e expandida.

**F055:** a Boas-vindas deixa de ser mural de cards. Fica o vídeo do
tutorial e um card **Primeiros passos** (três linhas). Navegação da
plataforma é o que o vídeo ensina — ver [F055](F055-boas-vindas-trilha.md).

## Critérios
- [x] Space `boas-vindas` no seed (topo da lista de Spaces)
- [x] `/` = Feed com todos os posts **exceto** Boas-vindas; toggle compacto/expandido
- [x] `/spaces/boas-vindas` = tutorial Panda em destaque + um card
  **Primeiros passos** (F055; não é mais grade de cards de orientação)
- [x] Player Panda do tutorial da comunidade (`tutorial-intro-comunidade`)
  em 2 colunas no `lg`; trilha ao lado. Sem modal de orientação.
- [x] Comentários **desativados** em Boas-vindas (orientação, não conversa)
- [x] Modal de post (Feed/Spaces): “Expandir” abre `/posts/[id]` ao lado do aside
- [x] Visão expandida do Feed mostra body (Markdown) + ações de reação no card
- [x] Preferência de vista do Feed persistida em `localStorage`
- [x] Primeiro acesso ao feed → Boas-vindas (F048)

## Relacionado
- F058 — tutorial Panda distinto para free e paid

## Fora de escopo
- Dark theme estilo Circle
- Calendário / ranking / gamificação

## Arquivos
- `src/components/welcome-space-view.tsx`, `post-modal.tsx`, `feed-list.tsx`, `post-detail-content.tsx`
- `src/actions/post-detail.ts`
- `prisma/seed.ts`, `src/lib/spaces/constants.ts` (tutorial Panda)
