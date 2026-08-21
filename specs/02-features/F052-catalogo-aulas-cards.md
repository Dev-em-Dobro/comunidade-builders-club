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
- Card: capa do módulo raiz (`coverImageUrl` em `/public`, série
  `1-renda-extra.png` … `4-fundamentos-builder.png`). A capa preenche
  a área 16:9 do card (largura × altura), sem recorte. Sem capa, cai
  para a thumb da primeira aula. Título, resumo da descrição, %
  concluído e quantidade de aulas na árvore.
- Clique no card → primeira aula da árvore (`/aulas/[moduleSlug]/[lessonSlug]`).
- Player: vídeo à esquerda; à direita, módulos com aulas (acordeão,
  progresso, aula atual destacada). Se a formação tiver trilhas
  intermediárias (ex.: **IA Aplicada** e **Automações com n8n**), a
  sidebar agrupa os submódulos sob esses títulos, com um divisor entre
  as trilhas. No desktop, a lista tem a mesma altura do bloco do
  player (vídeo + aula anterior/próxima) e rola por dentro, para a
  descrição da aula continuar visível abaixo.
- Voltar do player vai para `/aulas` (grid).

## Critérios

- [x] `/aulas` é um grid de cards, não a árvore inteira na mesma página
- [x] Clique no card abre o player da primeira aula daquele módulo
- [x] Barra de progresso do card reflete aulas concluídas na árvore
- [x] Sidebar lista os módulos da jornada sem sair do player
- [x] Formação com trilhas internas (IA / n8n) aparece agrupada, não
  como uma lista plana
- [x] Detalhes e comentários ficam abaixo do vídeo, em abas
- [x] Cards raiz usam capas de workspace no mesmo estilo (não frames
  aleatórios de vídeo)
- [x] Capa ocupa a área inteira do card, sem corte

## Dependências

F011 · F028 · F050
