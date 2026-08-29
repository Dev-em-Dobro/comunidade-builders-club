# F069 — Faixa de upgrade na tela de Boas-vindas

## Status
Rascunho — 2026-08-29

## Contexto

Pendência aberta na
[F063](F063-funil-presente-conta-free.md#pendente--levantado-no-teste-de-27082026)
e reconfirmada no reteste do fluxo free em 29/08/2026, já com F065, F067 e
F068 no ar.

Hoje o membro free **só encontra a oferta quando esbarra em um cadeado**.
Percorrendo a jornada inteira com conta nova, os únicos empurrões que não
dependem de bater numa tranca são:

- a linha do feed ("…**Ver planos**")
- o item "Planos" dentro do menu da conta

Os dois são discretos por construção. Todo o resto — modal de reagir, de
comentar, de space, o card da aula bloqueada — só aparece **depois** da
frustração. Isso significa que quem usa o gratuito exatamente como ele foi
desenhado (lê o feed, assiste o M01, posta no Desafio Projetos) pode passar
semanas sem nunca ler a oferta.

## Por que em Boas-vindas

É a única superfície do produto que ela abre **por vontade própria** para
saber o que fazer, e é onde ela volta quando está perdida. Também é a
página onde a F063 decidiu **não** colocar a oferta dentro da trilha:

> "Primeiros passos" é onboarding, não pitch: colocar a página de preço
> como terço do primeiro dia inverte a lógica de **prova antes de oferta**.

Esta feature respeita a decisão. A oferta não entra na trilha — entra
**depois** dela, como faixa própria e visualmente separada, do mesmo jeito
que o bloco da F063 fecha a página do presente sem interromper a leitura.

## Decisões

### 1. Onde

Faixa de largura total em `welcome-space-view.tsx`, **abaixo** do grid
player + Primeiros passos. Nunca acima, nunca dentro do card da trilha.

Só na tela de Boas-vindas. O feed já tem a sua linha; repetir a faixa em
outras telas transforma empurrão em barulho.

### 2. Quem vê

Só `!isPaid`. Admin e instructor não veem (a mesma regra da F041 já os
trata como pagos). O componente recebe `isPaid`, que `WelcomeSpaceView` já
tem — sem query nova.

**Aparece também na primeira visita.** Alternativa considerada e recusada:
esconder enquanto `welcomeSeenAt` for nulo. Seria barato (o campo existe),
mas some justamente quando ela está mais quente — acabou de criar conta
vindo de um presente — e a faixa já está abaixo da trilha, então não
atropela o onboarding.

### 3. O que diz

Fonte única de verdade: `checkout.ts`. Nada de preço ou promessa
digitados à mão.

- Título: `PROMESSA_PRIMEIRO_CLIENTE` — "Feche o 1º cliente em 90 dias"
- Corpo, em três ganhos concretos e na ordem que ela vive:
  1. **A formação inteira** — nicho, prospecção, abordagem e fechamento
  2. **Skills e templates** — proposta, contrato e os kits de entrega
  3. **A comunidade inteira** — comentar, reagir e publicar em todos os
     spaces
- Âncora de preço: "a partir de `12× R$ 30,18`", lido de
  `ofertaPro().pricing`. Sem "sem juros" (regra da F053 — o parcelado tem
  acréscimo)
- CTA único: **Ver os planos**

Um CTA só. Dois botões numa faixa de onboarding viram ruído; a escolha
entre PRO e Elite é o trabalho da `/planos`.

### 4. Rastro de origem

O CTA aponta para `hrefPlanos({ motivo: "boas-vindas" })`.

Isso exige um motivo novo em `UpgradeReason`, `UPGRADE_REASONS` e
`UPGRADE_REASON_COPY` (`capabilities.ts`), com a copy da `/planos` para
esse caminho:

> **Do primeiro dia ao primeiro cliente** — Você já tem o Comece por aqui,
> o feed e os presentes. PRO e Elite abrem a formação até o fechamento, as
> skills, os templates e a comunidade inteira.

Dois motivos para não reusar `geral`:

1. **Continuidade** — quem clica na faixa cai numa `/planos` que continua
   a frase da faixa, não numa genérica
2. **Medição** — o `motivo` na URL é o único jeito de separar "veio da
   faixa" de "veio de um cadeado" quando existir análise de funil

O motivo nunca abre modal: a faixa é link, não gate. Ele existe só para
`hrefPlanos` e para a copy da página.

Anônima em `/planos` continua ignorando `motivo` (decisão 2 da F063) — a
faixa só existe para quem tem sessão, então não há conflito.

### 5. Forma

Card de largura total com a borda de acento — a mesma linguagem do bloco
de promessa do presente (F063), para que a oferta tenha uma cara só no
produto inteiro. No mobile empilha: título, ganhos, preço, botão.

Não é dispensável. Sem "fechar", sem cookie, sem campo novo no `Profile`.
Ela vive numa página que a pessoa escolhe abrir; um X aqui é estado para
manter sem problema para resolver.

## Fora de escopo

- Faixa no feed, nas aulas ou em qualquer outra tela
- Dispensar/ocultar a faixa (exige persistência)
- Teste A/B ou variação de copy por origem de cadastro
- Mudança de preço, de checkout ou das ofertas
- Analytics de clique — hoje não existe pipeline; o `motivo` é o gancho
  para quando existir

## Riscos

- **Virar anúncio.** Se crescer ou subir para cima da trilha, queima a
  única tela de onboarding que a pessoa abre sozinha. Ela fecha a página,
  não a interrompe.
- **Repetição.** Free volta a Boas-vindas várias vezes na primeira semana.
  Uma faixa fixa e discreta aguenta; uma faixa grande cansa.

## Critérios

- [ ] Spec antes do código
- [ ] Free vê a faixa em Boas-vindas, abaixo da trilha
- [ ] Pago, admin e instructor não veem
- [ ] Título e preço vêm de `checkout.ts` (sem string duplicada)
- [ ] CTA leva a `/planos?motivo=boas-vindas`
- [ ] `/planos` com esse motivo mostra a copy de continuidade
- [ ] `motivo=boas-vindas` não abre modal em lugar nenhum
- [ ] Trilha continua sem pitch (F063)
- [ ] Layout empilha no mobile
- [ ] Validado em local com conta free real; Preview antes de prod
