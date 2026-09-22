# F100 — Link interno na descrição da aula não baixa arquivo

## Status
Pronto — 2026-09-22

Depende de: [F011](F011-aulas-panda-video.md) (markdown da aula),
[F099](F099-aula-texto-precificacao-gpt-maker.md) (link `/entregaveis/precificacao`).

## Contexto

Na aula **Como cobrar por agentes**, o link `[Ver precificação](/entregaveis/precificacao)`
baixava `precificacao.html` em vez de abrir a página do material.

Causa: `renderInlineMarkdown` tratava **qualquer** `href` começando com `/`
como download (`download={true}`). Isso servia para `/materiais/arquivo.zip`.
Rotas do app viravam o HTML da página baixado com o nome do último segmento.

## Decisão

1. `download` só em `/materiais/…` (anexo da aula, F011).
2. Rota interna sem isso (`/entregaveis/precificacao`, `/planos`, `/aulas/…`)
   navega na mesma aba, sem `download`.
3. `http(s)` continua em nova guia.

## Critérios

- [x] Spec antes do código
- [x] Clique em Ver precificação abre `/entregaveis/precificacao` no app
- [x] `[arquivo](/materiais/foo.xlsx)` continua baixando
- [x] Link `https://…` continua em nova guia
