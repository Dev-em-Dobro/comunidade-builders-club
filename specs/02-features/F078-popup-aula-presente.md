# F078 — Pop-up da aula de abertura no Presente

## Status
Rascunho — 2026-09-04

Depende de: [F059](F059-presentes-publicos-atribuicao.md) (Presente público, OTP e
atribuição por `utm_content`), [F063](F063-funil-presente-conta-free.md) (bloco da
promessa e razão do cadastro), [F065](F065-aulas-fase-1-free.md) (o módulo
_Comece por aqui_ liberado para conta grátis).

## Contexto

Número medido no post `gandalf-2026-08-31`:

```
142 visitas  →  3 cadastros (2,1%)  →  0 planos
```

O gargalo é **visita → cadastro**. O `0 assinaram` não é sinal: com base 3 não dá
para concluir nada sobre plano.

A página do Presente entrega 100% do conteúdo sem cadeado — decisão deliberada da
F059 — e só pede conta **depois** do artigo inteiro, no `GiftSignupForm`. Quem veio
do DM pega o que queria e vai embora. Não existe nenhum momento, no meio da
leitura, em que a pessoa seja convidada a entrar.

Esta feature cria esse momento, e paga por ele com uma entrega concreta: a aula de
abertura do Club, que a F065 já liberou para conta grátis.

## O conflito com a F063, e por que ele é aceito

A [F063](F063-funil-presente-conta-free.md) diz que a oferta **nunca** aparece
antes do conteúdo, "para não cobrar pedágio por algo anunciado como presente".
Uma modal aos 60 segundos interrompe a leitura no meio — no Presente do Saga
(~8.900 caracteres, 6-7 min de leitura) isso cai por volta de 15% do artigo.

É pedágio, e é o segundo consecutivo: a [F077](F077-cta-imersao-no-presente.md) já
colocou uma faixa de venda acima do artigo. A decisão foi do dono do produto em
04/09/2026, com o número de conversão na mesa.

O que separa este caso e mantém a regra da F063 de pé:

| | Bloco da promessa (F063) | Faixa da imersão (F077) | Pop-up (F078) |
|---|---|---|---|
| O que oferece | PRO/Elite (pago) | evento pago, de fora | **aula grátis, dentro do app** |
| Onde | depois do `</article>` | acima do `<article>` | modal, sobre a página |
| Interrompe? | não | não | **sim** |
| Custo para a leitora | — | — | um `Esc` |
| Fecha sozinho? | — | em 24/09/2026 | dispensa lembrada 30 dias |

A diferença que justifica: as outras duas **vendem**; esta **dá**. A modal não
cobra pedágio para continuar lendo — o artigo segue inteiro atrás dela, e fechar
custa uma tecla. O que ela pede é o e-mail em troca de uma aula que a pessoa
poderia não descobrir que existe.

## Decisões

### 1. Dispara aos 60 segundos, e só para quem não tem conta

`setTimeout` de `POPUP_DELAY_MS` (60.000) na montagem. Não aparece para sessão
logada — free ou paga. Quem já é membro não tem o que ganhar com um convite para
criar conta, e a modal só atrapalharia a leitura.

Sem gatilho de rolagem e sem exit-intent nesta versão: um gatilho só é mais fácil
de medir. Se 60s se mostrar cedo ou tarde, é uma constante.

### 2. O e-mail é capturado dentro da modal, no fluxo que já existe

A modal renderiza o **mesmo `GiftSignupForm`** do rodapé, com outra copy. Isso não
é economia de código, é correção: o `GiftSignupForm` é quem chama
`authClient.emailOtp` e `completarCadastroPresenteAction`, e é esse par que fecha a
atribuição da F059 — o cookie `bc_origem` está no host, o OTP mantém a pessoa na
**mesma aba**, e o `Membership.origin_utm_content` nasce preenchido.

Um formulário paralelo na modal teria que reimplementar isso e erraria a origem em
silêncio, que é exatamente o modo de falha que a F059 passou uma spec inteira
evitando.

Nome e sobrenome continuam obrigatórios: `completarCadastroPresenteAction` os exige
(`z.string().trim().min(1)`) e o `displayName` sai deles. Reduzir para só e-mail
é uma mudança de fluxo de cadastro, não de pop-up — fica para uma feature própria,
onde dê para medir o efeito isolado.

### 3. Cadastrou pela modal, vai para a aula — não para Boas-vindas

`GiftSignupForm` ganha `redirectTo?: string`, com default
`/spaces/${WELCOME_SPACE_SLUG}` — o rodapé não muda de comportamento.

A modal passa `AULA_ABERTURA_HREF`. A promessa foi "assista à aula"; entregar
Boas-vindas seria trocar o prêmio no meio do caminho.

`alreadyHadAccount` (a pessoa já era membro) mantém o comportamento atual: mensagem
e `router.refresh()`, sem redirecionar. Ela não se cadastrou agora, e a origem dela
não foi alterada.

### 4. A oferta é o módulo inteiro, não uma aula

A oferta não é "uma aula": é **acesso gratuito às primeiras aulas**. O módulo
`fase-1-m01-comece-por-aqui` é o único com `freeAccess`, e em produção (conferido
em 04/09/2026) ele tem **cinco**:

| # | Aula |
|---|---|
| 1 | Introdução ao Builders Club |
| 2 | Como usar a comunidade |
| 3 | Desafio primeiro projeto em 7 dias com Lovable |
| 4 | Bem-vindo e mapa da jornada |
| 5 | O que você vai construir e vender com IA |

Isso resolve um desencontro que existia no rascunho desta spec. Prometer "aula de
como fechar o primeiro cliente" e entregar a de abertura seria isca, e queimaria a
boa vontade que o Presente acabou de construir — o ativo mais caro desta página.
Prometer **cinco aulas liberadas** é verdade, é mais generoso, e a aula 5 ("O que
você vai construir e vender com IA") é justamente a que mais se aproxima do que a
pessoa veio buscar.

`PROMESSA_PRIMEIRO_CLIENTE` entra como o que o **Club** persegue, não como o título
de uma aula que não existe.

### 4.1. O número de aulas é contado, não escrito

O "5" não é constante: o admin pode publicar uma aula amanhã e a copy vira mentira
sozinha. `contarAulasGratuitas()` conta no banco, no servidor, e a página passa o
número para a modal. A página do Presente já é dinâmica (F059), então não há cache
para envelhecer.

Se a contagem falhar ou vier zero, a copy cai para a forma sem número ("as
primeiras aulas"). Uma modal sem número converte menos; uma modal com número errado
custa a confiança.

Copy em `src/lib/presentes/popup-aula.ts`, com o número como parâmetro. Trocar
texto ou destino é mudar um objeto, num arquivo — mesma escolha da
[F077](F077-cta-imersao-no-presente.md#3-a-copy-do-evento-mora-em-srclibeventos-não-no-tsx).

### 5. Dispensou, não volta por 30 dias

`localStorage["bc_popup_aula_v1"]` guarda o timestamp da dispensa;
`POPUP_DISPENSA_MS` (30 dias) define quando pode voltar. Global, não por Presente:
quem fechou não quer ver de novo no próximo link do DM.

É armazenamento **funcional** — uma preferência de "não me mostre isso de novo",
sem dado pessoal e sem rastreamento. Não entra no gate de consentimento da
[F057](F057-cookies-consentimento.md), que existe para o Clarity.

O `v1` no nome é para poder recomeçar do zero se a oferta mudar, sem carregar a
dispensa da campanha anterior.

### 6. Modal acessível, e fechável de quatro jeitos

`role="dialog"`, `aria-modal`, `aria-labelledby` no título. Fecha com **Esc**,
com o **X**, com clique no **fundo** e com o link "Agora não". O foco vai para a
modal ao abrir e volta para o `<body>` ao fechar; o scroll do fundo trava enquanto
ela estiver aberta e é devolvido no fechamento.

Uma modal sem `Esc` num artigo é um sequestro, não um convite.

### 7. Isto adiciona JavaScript à página

A F077 fez questão de ser HTML servido. Esta não tem como: precisa de relógio,
`localStorage` e estado de formulário. O custo é assumido e medido — o
`GiftSignupForm` já era client component, então o que entra novo é a modal e o
timer, não o formulário.

## O que muda

| Arquivo | Mudança |
|---|---|
| `src/lib/presentes/popup-aula.ts` | novo — copy, href, delay, dispensa e `contarAulasGratuitas` |
| `src/lib/presentes/popup-aula.test.ts` | novo — dispensa válida/expirada/corrompida e copy por número |
| `src/app/presentes/presente-aula-popup.tsx` | novo — a modal |
| `src/components/gift-signup-form.tsx` | ganha `redirectTo` (default: Boas-vindas) |
| `src/app/presentes/presente-publico.tsx` | conta as aulas e monta a modal só para sessão anônima |

Sem migration. Sem env nova. Sem mudança no `GiftVisit` nem na atribuição.

## O que esta feature não muda

- O corpo do Presente e a fronteira da F070 (o artigo é do Dobro, sem CTA no markdown)
- O `GiftSignupForm` do rodapé: mesma copy, mesmo destino, mesmas variantes
- O `PresentePromessa` e a faixa da F077
- O gate de tier de qualquer aula: o M01 já era liberado pela F065
- A atribuição da F059 — a modal usa o mesmo caminho de cadastro

## Fora de escopo

- Gatilho por rolagem ou exit-intent
- Pop-up em qualquer outra página (feed, boas-vindas, planos)
- Reduzir o cadastro a só e-mail (mudança de fluxo, feature própria)
- Teste A/B ou métrica de clique própria — a leitura continua sendo
  `gift_visit` × `membership.origin_utm_content` (F059)
- Escolher a aula por Presente: uma constante enquanto for uma aula só

## Riscos

- **Pedágio percebido.** O risco que a F063 nomeia, agora numa modal. Mitigação é
  de forma: 60s de leitura antes, `Esc` fecha, o artigo continua inteiro atrás.
  Se a leitura do Presente cair, o gatilho sobe de 60s ou a feature sai.
- **Promessa maior que a aula.** Endereçado na decisão 4, mas volta a existir na
  primeira vez que alguém reescrever a copy sem assistir a aula.
- **Duas ofertas na mesma tela.** Até 24/09 convivem a faixa da imersão (paga, de
  fora) e a modal (grátis, de dentro). São públicas diferentes, mas se a imersão
  render menos durante o período, esta modal é a primeira suspeita.
- **`localStorage` bloqueado.** Navegador em modo restrito faz o acesso lançar. O
  código trata como "nunca dispensou" em vez de quebrar a página.

## Critérios de aceitação

Marcado só o que foi verificado por teste, tipo ou leitura de código. O que
depende de navegador fica aberto até a validação em Preview.

- [x] Spec antes do código
- [x] Copy, href da aula, delay e prazo em `src/lib/presentes/popup-aula.ts`, sem Next
- [x] Número de aulas contado no banco, não escrito na copy
- [x] Contagem zero ou falha cai na copy sem número, sem quebrar
- [x] Não abre para sessão logada (free ou paga) — `!user` em `presente-publico.tsx`
- [x] Não abre se dispensada há menos de 30 dias
- [x] Volta a abrir depois de 30 dias
- [x] `localStorage` indisponível não quebra a página
- [x] E-mail capturado dentro da modal, pelo `GiftSignupForm`
- [x] Cadastro pelo formulário do rodapé continua caindo em Boas-vindas
- [x] Quem já tinha conta vê a mensagem de sempre, sem redirecionar
- [x] `npx tsc --noEmit` limpo
- [x] `npm test` verde — 103 testes, 10 desta feature
- [x] `npm run build` compila
- [ ] Modal abre 60s depois de abrir o Presente
- [ ] Cadastro novo pela modal cai em `/aulas/fase-1-m01-comece-por-aqui/aula-introducao-builders-club`
- [ ] `Membership.origin_utm_content` gravado igual ao do rodapé
- [ ] Fecha com Esc, X, clique no fundo e "Agora não"
- [ ] Foco entra na modal e volta ao fechar; scroll do fundo trava e destrava
- [ ] Conferido no tema claro e escuro, mobile (390px) e desktop (1280px)
- [ ] Preview / HML antes de produção

## Verificação

- `npx tsc --noEmit`: limpo.
- `npx eslint` nos arquivos tocados: limpo.
- `npm test`: 103 testes, todos passando (93 antes + 10 desta feature).
- `npm run build`: compila. `/presentes/[slug]` foi de **125 kB para 127 kB** de
  First Load JS — os ~2 kB da modal, o custo que a decisão 7 assume.
- Contagem de aulas conferida no banco de **produção** em 04/09/2026: o módulo
  `fase-1-m01-comece-por-aqui` é o único com `freeAccess` e tem **5** aulas, todas
  com `published = true` no módulo e na aula.

  | # | Aula |
  |---|---|
  | 1 | Introdução ao Builders Club |
  | 2 | Como usar a comunidade |
  | 3 | Desafio primeiro projeto em 7 dias com Lovable |
  | 4 | Bem-vindo e mapa da jornada |
  | 5 | O que você vai construir e vender com IA |

  O seed (`scripts/seed-aulas-panda.mts`) tem só 3 — está defasado em relação à
  produção. A contagem em runtime existe justamente para não depender disso.

- **Falta:** tudo que só o navegador responde — o timer de 60s, o Esc, o foco, o
  scroll travado, os dois temas, e o cadastro ponta a ponta caindo na aula com a
  origem gravada. Nada disso foi observado rodando; a validação é em Preview.
