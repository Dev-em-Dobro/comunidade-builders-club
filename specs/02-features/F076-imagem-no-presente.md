# F076 — Imagem no Presente: capa que abre e print no meio do texto

## Status
Em implementação — 2026-09-03

Depende de: [F059](F059-presentes-publicos-atribuicao.md) (presente público),
[F060](F060-aula-desafio-quick-win.md) (variante `reading` do markdown),
[F070](F070-contrato-artigo-cta-presente.md) (o corpo é do Dobro, o CTA é do Club).
**Não muda o contrato da F070:** imagem é conteúdo do artigo, entra pelo corpo,
e nada abaixo do `</article>` é tocado.

## Contexto

O Presente virou artigo longo (o `mapa` tem 12 mil caracteres), e é texto puro
do começo ao fim. O dono da editorial descreveu assim, em 03/09/2026: "os
artigos estão visualmente pobres, eles poderiam ter uma imagem de capa legal? e
imagens de prints no corpo quando fizer sentido?".

Não era escolha editorial, eram dois limites do código:

1. **Imagem no corpo não existia.** O `MarkdownBody` (`src/lib/markdown/index.tsx`)
   tem uma lista fechada de blocos: parágrafo, `##`, `###`, lista e bloco de
   código. Escrever `![print](url)` produzia um `!` solto seguido de um link
   azul, porque só o `[print](url)` casava no regex inline.
2. **A capa existia, mas no fim.** O `Post.imageUrl` era renderizado pelo
   `PostMedia` **depois** do corpo (`presente-publico.tsx`), então o que seria
   capa chegava como rodapé, e a página abria sempre com um bloco de texto.

## Decisões

### 1. Imagem é bloco, nunca inline

`![legenda](url)` sozinho na linha vira `<figure>`. No meio de uma frase, não:
imagem no meio de parágrafo quebra a coluna de leitura, e quem escreve tem de
decidir onde ela entra. O parser vive em `parseImagemBloco`
(`src/lib/markdown/text.ts`), fora do `.tsx`, para ser testável sem React.

Regressão coberta: `![x](y)` escrito inline agora sai como link comum, sem o `!`
solto que aparecia antes.

### 2. A legenda é o `alt`

O texto do colchete vira `<figcaption>` **e** `alt` da imagem. Quem escreve não
precisa lembrar de dois campos, e quem usa leitor de tela ouve a mesma frase que
está impressa embaixo da imagem. `![](url)`, sem legenda, é permitido para
imagem decorativa: sai sem `figcaption` e com `alt` vazio, que é o correto para
decoração.

### 3. Só http(s) e caminho interno

`parseImagemBloco` recusa o que o `isSafeHref` recusa, então `javascript:` e
`//host` externo não entram. O corpo do Presente é escrito por fora do app e
colado, então essa porta precisa continuar estreita.

### 4. A capa abre o artigo

`imageUrl` passa a ser renderizada antes do `<h1>`, com `priority` (é o
candidato a LCP da página), altura máxima de `22rem` e `object-cover`. O
`PostMedia` do fim continua existindo para vídeo e link, agora sem `imageUrl`,
para a mesma imagem não aparecer duas vezes.

## O que muda

| Arquivo | Mudança |
|---|---|
| `src/lib/markdown/text.ts` | `parseImagemBloco`, exportado e testado |
| `src/lib/markdown/index.tsx` | bloco `<figure>`, escala `figure`/`caption` por variante, `!?` no regex inline |
| `src/app/presentes/presente-publico.tsx` | capa antes do título; `PostMedia` sem `imageUrl` |
| `src/lib/markdown/imagem-bloco.test.ts` | 7 casos, incluindo os dois de segurança |

## O que esta feature não muda

- O composer e o feed: quem posta pelo app continua anexando imagem como antes,
  pelo `imageUrl`, e o feed segue mostrando pelo `PostMedia`.
- O CTA e o cadastro (F070, F063): nada abaixo do `</article>`.
- O contrato de quem escreve o quê: a imagem entra no markdown que o Dobro
  escreve, junto do texto.

## Onde as imagens moram

Fora deste repositório. A editorial hospeda os arquivos e cola a URL no corpo; o
`next.config.ts` já aceita qualquer host https em `remotePatterns`. O Vercel
Blob continua sendo o destino de quem sobe imagem pelo app (`/api/upload`, 1 MB,
convertido para WebP a 1600px), e é a referência de peso recomendada para quem
hospeda por fora: **WebP, no máximo 1600px de lado.**

## Verificação

- `npx tsc --noEmit`: limpo.
- `npx tsx --test src/lib/**/*.test.ts`: 59 testes, 59 passando.
- `npm run build`: compila, `/presentes/[slug]` em 125 kB de First Load JS.
- Falta: conferir em homologação um presente com capa e um print no meio do
  texto, no claro e no escuro, no celular e no desktop.
