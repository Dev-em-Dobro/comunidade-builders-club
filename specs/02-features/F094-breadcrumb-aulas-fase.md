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

- `Aulas` → `/aulas`
- Cada ancestral (fase + trilhas + módulo) → 1ª aula **daquele** nó
  (`flattenLessons`), para o clique no submódulo não jogar no módulo
  principal da fase
- A **aula** é o último crumb (`aria-current="page"`), sem link
- O `h1` da aula abaixo permanece; o subtítulo do módulo sob o player
  também

## Critérios

1. Na página da aula, o nome da fase/formação raiz aparece no breadcrumb
2. Com trilha intermediária (ex.: IA Aplicada), o caminho inclui a trilha
3. O título da **aula atual** é o último crumb
4. `Aulas`, fase, trilha e módulo são clicáveis; a aula atual não
5. Clique num submódulo abre a 1ª aula **desse** submódulo (não a da fase)
6. O subtítulo do módulo sob o player permanece (não some)

## Fora de escopo

- Página intermediária de outline da fase (o card continua abrindo a
  primeira aula — F052)
- Mudar a sidebar do curso
