# F061 — Leitura de posts: listagem, página interna e presente público

> O ID começou como F060 e mudou: `F060` foi tomado por
> [F060-aula-desafio-quick-win](F060-aula-desafio-quick-win.md).

## Status
Implementado — 2026-08-26

## Objetivo

Post é conteúdo, não recado de chat. A listagem e a página interna
tratavam os dois do mesmo jeito: card de rede social, avatar grande
empurrando o texto, título menor que o nome do autor, contadores em
texto corrido. O aluno passa o olho e não sabe do que o post trata.

Referência de leitura: **Medium**. O que importa dele não é o visual —
é a hierarquia: **título manda**, autor é linha de crédito, e o corpo é
uma coluna de leitura com tipografia grande.

Não é redesenho do tema. A paleta, o raio, a borda e as fontes do
Builders Club continuam.

## Diagnóstico da largura (o que motiva a coluna de leitura)

O pedido original foi "a área de texto do Medium é mais larga, a nossa
está curta". A medição mostrou o contrário — o problema era o oposto:

| | antes | Medium | F061 |
|---|---|---|---|
| largura do texto | ~890px | 680px | **748px** |
| corpo | 16px | 20px | **20px** |
| entrelinha | 1.625 | 1.58 | **1.7** |
| caracteres por linha | ~120 | ~72 | **74** |

Sidebar 260px + `main px-8` + `feed-wrap max-w-5xl` (1024px), menos o
recuo do avatar (52px) e o padding do card (80px). A leitura do Medium
parece mais larga porque a **fonte é maior dentro de um bloco fechado**
— linha de 120 caracteres é o que cansa, não a falta de pixels.

A largura fica em `--bc-reading` (`globals.css`), num lugar só.

## Listagem (feed, space, busca)

O card continua — borda, raio e sombra do tema. Muda a hierarquia
interna:

1. **Linha de crédito** no topo: avatar pequeno (24px) *inline* com
   nome, space e data, em 14px. Deixa de ser coluna lateral.
2. **Título** passa a dominar: 20px no mobile, 24px no desktop, bold,
   `leading-snug`, até 3 linhas.
3. **Preview** de 2 linhas do corpo, 16px, `text-muted`.
4. **Rodapé de interações com ícones** no lugar de texto corrido:
   coração (reações), balão (comentários), olho (leituras). Número ao
   lado do ícone. O `⋯` vira ícone de verdade.

A imagem do post continua como está (abaixo do preview). **Não** entra
a miniatura de capa à direita da referência.

## Página interna `/posts/[id]`

Ordem passa a ser a de um artigo:

1. Volta para o space (como antes)
2. **Título** — `h1` de verdade, 30px mobile / 42px desktop, bold
3. **Linha do autor** — avatar 40px, nome, space e data
4. **Barra de interações** entre dois filetes: coração, balão, olho e
   compartilhar, em ícones
5. **Corpo** em coluna de leitura: 20px, `line-height` 1.7,
   parágrafos com respiro, `##` e `###` com escala de artigo
6. Mídia do post
7. Comentários (inalterado)

Sai o `post-card` em volta do artigo e o recuo do avatar — o texto
começa na margem, como o título.

O `PostDetailContent` continua servindo o `post-modal` (`compactHeader`):
no modal a coluna de leitura não se aplica, o container já é estreito.

## Presente público `/presentes/[slug]` (F059)

Leitura pública é leitura: a página do presente recebe a mesma coluna e
a mesma escala. Sai o `max-w-xl` (576px) e o `post-card` em volta; o
título vira `reading-title` e o corpo usa `variant="reading"`.

**Correção de comportamento.** O corpo só renderizava sob
`link?.showBody`. Presente **sem link** tinha `link === null` e a página
mostrava só o título — o texto sumia inteiro. Passa a ser:

```ts
const showBody = link ? link.showBody : gift.body.trim().length > 0;
```

Presente que é link continua igual (card de abrir); presente que é texto
passa a ser legível. Ver [F059](F059-presentes-publicos-atribuicao.md).

## Reagir

O botão "Reagir (3)" vira ícone + contagem (`ReactionButton`, extraído
de `PostActions`), disponível também na listagem — antes só existia na
página do post.

- **Reagido pinta de vermelho** (`red-500`; `red-400` no tema escuro). O
  número segue cinza, alinhado com os outros dois contadores.
- **Estado otimista**: pinta e conta no clique, reverte se o servidor
  recusar. Sem isso a animação tocaria num ícone ainda cinza.
- **`disabled={pending}` foi removido** — apagava o botão durante o
  request e engolia o clique seguinte. Em troca, cliques rápidos podem
  piscar o número até o refresh assentar.

### Animação

| gesto | efeito |
|---|---|
| reagir | `heartPop` (1 → 1.4 → 0.88 → 1.08 → 1, 0.45s) + `heartFloat`: um segundo coração sobe 26px desbotando |
| desfazer | `heartUndo` — encolhida discreta de 0.25s, sem coração subindo |

`prefers-reduced-motion: reduce` desliga as três e some com o coração
que sobe. É a primeira regra de movimento reduzido do `globals.css`.

## Escala tipográfica de leitura

`MarkdownBody` ganha `variant="reading"`:

| bloco | padrão (feed) | reading |
|---|---|---|
| parágrafo | 16px / 1.625 | 20px / 1.7 |
| `##` | 15–16px | 26px, `mt-10` |
| `###` | 14–15px | 20px, `mt-8` |
| lista | 16px | 20px, itens com respiro |
| `code` bloco | 13px | 15px |
| linha em branco (F043) | 12px | 20px |

A semântica de linha em branco de [F043] não muda: continua virando
espaçamento, só escala junto.

## Seed de desenvolvimento

`scripts/seed-dev-posts.mts` (`npm run db:seed:dev-posts`) popula o banco
**local** com posts que exercitam a leitura: texto longo com `##`,
listas e código, post curto, com imagem, com link, com comentários e
respostas, mais um presente público. Recusa rodar se `DATABASE_URL` não
apontar para `127.0.0.1`/`localhost`. Idempotente.

## Critérios

- [x] Na listagem o título é o elemento mais forte do card
- [x] Reações, comentários e leituras aparecem como ícone + número
- [x] Nenhuma miniatura de capa nova na listagem
- [x] `/posts/[id]` abre com `h1` visível (não mais `sr-only`)
- [x] Corpo do post entre 70 e 80 caracteres por linha no desktop (74)
- [x] `/presentes/[slug]` legível para visitante deslogado (HTTP 200 sem cookie)
- [x] Coração vermelho ao reagir, nos dois temas
- [x] Animação de reagir e de desfazer, com `prefers-reduced-motion`
- [ ] `post-modal` conferido na tela (só validado por tipo)
- [ ] Free tentando reagir abre o upgrade (F041) — não exercitado
- [ ] Mobile conferido

## Fora de escopo

- Miniatura de capa na listagem
- Tempo estimado de leitura ("13 min")
- Barra de progresso de leitura
- Posts relacionados no fim
- Subtítulo/capa como campos do post (mudaria o schema)
- Fonte serifada no corpo

## Pontas soltas encontradas no caminho

Não entram nesta feature, mas apareceram na revisão visual:

- **"Fixar / Editar / Remover" solto no rodapé do card** compete com os
  ícones; na página do post fica espremido entre o texto e os
  comentários. Deveria ir para o menu `⋯`.
- **`MarkdownBody` não trata blockquote** — o `>` aparece cru no corpo.
  Lacuna antiga, não regressão desta PR.
- **Coluna do presente ancora à esquerda** em vez de centralizar: sem a
  sidebar não há contrapeso para o `mx-auto`.

[F043]: F043-markdown-linhas-em-branco.md
