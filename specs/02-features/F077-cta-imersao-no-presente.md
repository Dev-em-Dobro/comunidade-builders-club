# F077 — CTA da Imersão "2 a 5k com IA" no topo do Presente

## Status
Em implementação — 2026-09-02

Depende de: [F059](F059-presentes-publicos-atribuicao.md) (Presente público e
atribuição por `utm_content`), [F063](F063-funil-presente-conta-free.md) (bloco
da promessa), [F070](F070-contrato-artigo-cta-presente.md) (o Dobro escreve o
artigo, o Club escreve o CTA).

## Contexto

A Dev em Dobro abre a **Imersão 2 a 5k com IA** em 22 e 23 de setembro de 2026,
19h30, ao vivo. A venda acontece em `imersao-ia.devemdobro.com/v1`, fora deste
app — ingresso de R$ 19 (ao vivo) e de R$ 97 (ao vivo + gravação vitalícia).

O Presente é a página de maior tráfego frio da comunidade: chega gente de
Instagram/DM que ainda não tem conta. Enquanto a imersão estiver de pé, essa
audiência é exatamente a que o evento quer.

## O conflito com a F063, e por que ele é aceito

A [F063](F063-funil-presente-conta-free.md) diz, com todas as letras, que a
oferta **nunca aparece antes do conteúdo**, "para não cobrar pedágio por algo
anunciado como presente". Esta feature coloca um card de venda acima do artigo.
O conflito é real e a decisão foi tomada pelo dono do produto em 02/09/2026.

O que separa os dois casos, e o que mantém a regra da F063 de pé:

| | Bloco da promessa (F063) | Faixa da imersão (F077) |
|---|---|---|
| O que vende | o próprio Club (PRO/Elite) | um evento com data, de fora do app |
| Onde fica | depois do `</article>` | acima do `<article>` |
| Prazo | permanente | some sozinho em 24/09/2026 |
| Forma | bloco de oferta, dois CTAs | faixa de uma linha e meia, um CTA |

A F063 continua valendo para a oferta do Club: **nada de PRO, Elite, preço de
plano ou pedido de cadastro acima do artigo.** O que sobe é uma faixa de evento
datado, e ela sobe porque evento tem prazo — depois de 23/09 não adianta
convidar ninguém.

Isto **não** abre precedente para CTA permanente no topo. Bloco sem data de
validade acima do artigo exige spec nova.

## Decisões

### 1. A faixa tem prazo e some sozinha

`imersaoAtiva(agora)` compara o relógio com `IMERSAO_IA.terminaEm`
(`2026-09-24T00:00:00-03:00`, meia-noite depois da segunda aula). Passou da
data, o componente devolve `null` e a página volta a ser o que era.

É a decisão que dispensa alguém lembrar de remover código depois do evento — o
custo de esquecer é uma página do Presente convidando para uma imersão que já
aconteceu, o pior estado possível para tráfego frio.

O fuso está escrito no literal (`-03:00`). Sem isso, o servidor em UTC apagaria
a faixa três horas antes da hora no Brasil.

### 2. A copy é da landing, não uma reescrita

Promessa, data, formato e faixa de preço vêm da própria
`imersao-ia.devemdobro.com/v1`. Quem clica encontra a mesma frase que leu — e
quando o Dobro mudar a landing, o que muda aqui é um objeto, num arquivo.

A faixa diz: promessa, quando, quanto (a partir de R$ 19) e um botão. Não repete
grade, garantia, bônus nem prova social: isso é trabalho da landing, e a página
do Presente é para ler o Presente.

### 3. A copy do evento mora em `src/lib/eventos/`, não no `.tsx`

`src/lib/eventos/imersao-ia.ts` guarda texto, URL, prazo e o construtor de link.
Sem dependência de Next, testável — mesma escolha da
[F070](F070-contrato-artigo-cta-presente.md#4-o-bloqueio-é-no-servidor-em-publicar-e-editar)
para `cta-no-corpo.ts`. Uma pasta `eventos/` porque este não vai ser o último
evento com data marcada.

### 4. O link leva à landing, não ao checkout

`imersaoHref(utmContent)` monta
`https://imersao-ia.devemdobro.com/v1?utm_source=builders-club&utm_medium=presente&utm_campaign=imersao-ia`
e acrescenta `utm_content` quando o Presente foi aberto com um
(`/presentes/<slug>/<utmContent>`, F059).

Landing e não `pay.hub.la` direto por dois motivos: a escolha entre R$ 19 e R$
97 é da landing, e quem vem de um artigo ainda não sabe o que está comprando.
O `utm_content` é o que faz o Dobro saber **qual** Presente trouxe a venda, com
o mesmo valor que a F059 já usa para atribuir cadastro.

`sanitizeUtmValue` filtra o `utm_content` antes de entrar na URL — o valor vem
do path, é da leitora, e não pode virar querystring arbitrária.

### 5. Aparece para todo mundo, inclusive pagante

Diferente do bloco da F063, que some para quem já é pagante (`!isPaid`). A
imersão é produto de outra casa, ao vivo, de R$ 19: quem é PRO ou Elite não
"já comprou isso". Esconder da base paga seria esconder do público mais
propenso a ir.

Consequência assumida: um membro Elite vê um convite para um evento pago. É um
convite, não um cadeado — a página inteira continua acessível.

### 6. É HTML servido, sem JavaScript

Sem contador regressivo, sem client component. A landing já tem contador; a
faixa do Presente é um `<aside>` com um `<a>`. A página do Presente já é
dinâmica (usa `headers()` na F059), então a data é avaliada a cada request sem
cache para envelhecer.

## O que muda

| Arquivo | Mudança |
|---|---|
| `src/lib/eventos/imersao-ia.ts` | novo — copy, prazo, `imersaoAtiva`, `imersaoHref` |
| `src/lib/eventos/imersao-ia.test.ts` | novo — prazo, fuso e montagem da URL |
| `src/app/presentes/presente-imersao-cta.tsx` | novo — a faixa |
| `src/app/presentes/presente-publico.tsx` | renderiza a faixa acima do `<article>` |

## O que esta feature não muda

- O corpo do Presente e a fronteira da F070: o artigo continua sendo do Dobro e
  o `detectarCtaNoCorpo` continua bloqueando CTA no markdown, inclusive
  `pay.hub.la`
- O `PresentePromessa` e o `GiftSignupForm` abaixo do `</article>`: mesma copy,
  mesmas três variantes por sessão
- A atribuição da F059 — a faixa **lê** o `utm_content`, não escreve cookie nem
  visita
- Qualquer gate de tier, preço de plano ou checkout do Club
- Sem migration

## Fora de escopo

- Contador regressivo na faixa
- Faixa em qualquer outra página (feed, boas-vindas, planos)
- Analytics de clique próprio — a medição é por UTM, do lado do Dobro
- Cadastro no evento dentro do app: a venda é da landing, com checkout Hubla
  fora deste repositório
- Um cadastro de eventos no banco. Enquanto for um evento por vez, constante em
  `src/lib/` é mais barata que tabela

## Riscos

- **Pedágio percebido.** É o risco que a F063 nomeia e que esta feature aceita.
  Mitigação é de forma, não de código: faixa curta, um CTA, o `<h1>` do artigo
  logo abaixo. Se a métrica de leitura do Presente cair durante a imersão, a
  faixa desce para depois do artigo.
- **Data errada = página envergonhada.** `terminaEm` é a única linha que separa
  "convite" de "convite para evento que já passou". Está em constante, com
  teste, e o fuso é explícito.
- **A landing muda e a faixa mente.** Preço, data ou promessa mudam do lado do
  Dobro sem avisar o código. Conferir `imersao-ia.ts` contra a landing antes de
  cada deploy enquanto a imersão estiver no ar.

## Critérios de aceitação

- [x] Spec antes do código
- [x] Copy, URL e prazo em `src/lib/eventos/imersao-ia.ts`, sem Next
- [x] `imersaoAtiva` devolve `false` depois de `2026-09-24T00:00:00-03:00`
- [x] Componente devolve `null` quando `imersaoAtiva` é `false`
- [x] `imersaoHref` traz as três UTMs fixas e o `utm_content` do path quando existe
- [x] `utm_content` inválido não entra na URL
- [x] A faixa aparece acima do `<article>` e abaixo do cabeçalho da página
- [x] Aparece para deslogada, free e pagante
- [x] Nada abaixo do `</article>` muda
- [x] `npx tsc --noEmit` limpo
- [x] `npm test` verde — 93 testes, 10 deles novos
- [x] `npm run build` compila; `/presentes/[slug]` segue em 125 kB (sem JS novo)
- [x] Conferido no tema claro e escuro, mobile (390px) e desktop (1280px)
- [ ] Preview / HML antes de produção

## Verificação

- `npx tsc --noEmit`: limpo.
- `npm test`: 93 testes, todos passando (83 antes + 10 desta feature).
- `npm run build`: compila. `/presentes/[slug]` continua em 125 kB de First Load
  JS — a faixa é HTML servido, não entrou um byte de JavaScript.
- Render conferido no app local apontando para o banco de HML, nos dois
  Presentes que existem lá (`f076-teste`, com capa, e `eu-quero-26-08-2026`, sem):
  - ordem no DOM: cabeçalho → faixa → `<article>` → `PresentePromessa` →
    formulário. Nada abaixo do `</article>` mudou.
  - `/presentes/f076-teste/teste-f077` monta
    `...&utm_campaign=imersao-ia&utm_content=teste-f077`; sem `utm_content` no
    path, a URL sai sem o parâmetro.
  - tema claro e escuro, 1280px e 390px. No mobile o botão ocupa a largura toda
    e a faixa mede ~320px de altura; o `<h1>` do artigo continua acima da dobra
    em desktop.
- Falta: conferir no celular de verdade e validar em Preview antes da main.
