# F052 — Catálogo de aulas em cards

## Status
Em implementação

## Objetivo
A aba `/aulas` mostra **cards dos módulos de primeiro nível**. O aluno
clica no card e entra no **player da jornada**: vídeo + lista de módulos
ao lado + detalhes da aula abaixo.

Referência visual: classroom (capa nos cards; player com sidebar em
acordeão). Sem trava por “nível”, sem favoritar/avaliar neste recorte.

## Comportamento

- `/aulas` — grid de módulos **publicados** na raiz (`parentId` null).
- Card: capa (`coverImageUrl` ou thumb da primeira aula), título,
  resumo curto da descrição, % concluído e quantidade de aulas na árvore.
- Clique no card → primeira aula da árvore (`/aulas/[moduleSlug]/[lessonSlug]`).
- Player: vídeo à esquerda; à direita, módulos com aulas (acordeão,
  progresso, aula atual destacada). Abaixo: título, concluir, abas
  Informações / Comentários.
- Voltar do player vai para `/aulas` (grid).

## Critérios

- [x] `/aulas` é um grid de cards, não a árvore inteira na mesma página
- [x] Clique no card abre o player da primeira aula daquele módulo
- [x] Barra de progresso do card reflete aulas concluídas na árvore
- [x] Sidebar lista os módulos da jornada sem sair do player
- [x] Detalhes e comentários ficam abaixo do vídeo, em abas

## Dependências

F011 · F028 · F050
