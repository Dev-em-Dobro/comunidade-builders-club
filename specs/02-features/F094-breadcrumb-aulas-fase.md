# F094 — Breadcrumb de fase nas aulas

## Status
Implementada — 2026-09-20

Depende de: [F052](F052-catalogo-aulas-cards.md) (player + árvore de módulos).

## Problema

Ao clicar num card de fase/formação em `/aulas`, o aluno cai direto na
primeira aula. O player só mostrava `← Aulas` e o título do **submódulo**
(ex.: “Comece por aqui”). Sem o nome da **fase** (ex.: “FASE 1 — Do zero
ao primeiro sim”), não dava para saber em que jornada se estava — sobretudo
com várias formações no catálogo.

## Decisão

No player (`/aulas/[moduleSlug]/[lessonSlug]`), trocar o link único
`← Aulas` por um **breadcrumb**:

`Aulas › {fase/formação} › … › {módulo} › {aula atual}`

- `Aulas` → `/aulas` (único link — ancestrais não linkam)
- Cada ancestral (fase + trilhas intermediárias, se houver) e o módulo
  atual entram pelo caminho na árvore (`findModulePath`)
- A **aula** é o último crumb (`aria-current="page"`)
- Ancestrais são **texto**, não link: ` /aulas/[slug]` redireciona para a
  1ª aula daquele nó e, na fase, isso devolve o aluno ao módulo principal
  da jornada
- O `h1` da aula abaixo permanece; o subtítulo do módulo sob o player
  também

## Critérios

1. Na página da aula, o nome da fase/formação raiz aparece no breadcrumb
2. Com trilha intermediária (ex.: IA Aplicada), o caminho inclui a trilha
3. O título da **aula atual** é o último crumb
4. `Aulas` no breadcrumb leva de volta ao grid; fase/módulo não são links
5. Sem breadcrumb, o subtítulo do módulo sob o player permanece (não some)

## Fora de escopo

- Página intermediária de outline da fase (o card continua abrindo a
  primeira aula — F052)
- Mudar a sidebar do curso
