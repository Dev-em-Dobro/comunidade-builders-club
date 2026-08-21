# F052 — Catálogo de aulas em cards

## Status
Em implementação

## Objetivo
A aba `/aulas` mostra **cards dos módulos de primeiro nível**. O aluno
clica no card e vai para a **lista de aulas** daquele módulo
(`/aulas/[moduleSlug]`). A aula em si continua em
`/aulas/[moduleSlug]/[lessonSlug]`.

Referência visual: classroom tipo Skool (capa, título, resumo, barra de
progresso). Sem trava por “nível” neste recorte.

## Comportamento

- `/aulas` — grid de módulos **publicados** na raiz (`parentId` null).
- Card: capa (`coverImageUrl` ou thumb da primeira aula), título,
  resumo curto da descrição, % concluído e quantidade de aulas na árvore.
- Clique → `/aulas/[slug]` com a lista (submódulos + aulas), o mesmo
  recorte que o catálogo antigo mostrava *dentro* de um módulo raiz.
- Voltar da aula abre a lista do módulo raiz da jornada (não o grid).

## Critérios

- [x] `/aulas` é um grid de cards, não a árvore inteira na mesma página
- [x] Clique no card abre a lista de aulas daquele módulo
- [x] Barra de progresso reflete aulas concluídas na árvore
- [x] Player e URL da aula não mudam

## Dependências

F011 · F028 · F050
