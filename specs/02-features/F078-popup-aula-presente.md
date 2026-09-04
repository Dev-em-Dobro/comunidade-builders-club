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

Com `POPUP_DELAY_MS = 0`, esta feature passa por cima dessa regra de frente. Não
adianta suavizar: a modal chega **antes** de qualquer leitura. É o terceiro
avanço consecutivo sobre a mesma fronteira — a [F077](F077-cta-imersao-no-presente.md)
pôs uma faixa de venda acima do artigo, esta pôs uma modal aos 60s, e agora a
modal veio para a abertura. Todas decididas pelo dono do produto, com o número de
conversão na mesa (142 acessos → 3 cadastros no `gandalf-2026-08-31`).

| | Bloco da promessa (F063) | Faixa da imersão (F077) | Pop-up (F078) |
|---|---|---|---|
| O que oferece | PRO/Elite (pago) | evento pago, de fora | **aula grátis, dentro do app** |
| Onde | depois do `</article>` | acima do `<article>` | modal, sobre a página |
| Quando | depois da leitura | antes do título | **antes de tudo** |
| Custo para a leitora | — | — | um `Esc`, a cada visita |

O que **ainda** separa esta oferta das outras duas: as outras **vendem**, esta
**dá**. E ela não é gate — o `<article>` vem inteiro do servidor, a modal é
client-side, e fechar custa uma tecla. Quem fecha lê tudo.

O que **não** dá mais para dizer: que a modal respeita a ordem "entrega primeiro,
pedido depois". Não respeita. Essa era a defesa enquanto havia um minuto de
leitura antes, e ela caiu junto com o delay.

**A regra da F063 segue valendo para a oferta paga do Club:** nada de PRO, Elite
ou preço de plano antes do artigo. O que sobe aqui é um convite gratuito. Se
isso também for adiante, é spec nova — e aí a F063 precisa ser reescrita em vez
de contornada mais uma vez.

## Decisões

### 1. Dispara na abertura da página, e só para quem não tem conta

`POPUP_DELAY_MS = 0`: a modal aparece assim que a página hidrata. Não aparece
para sessão logada — free ou paga. Quem já é membro não tem o que ganhar com um
convite para criar conta, e a modal só atrapalharia a leitura.

Sem gatilho de rolagem e sem exit-intent: um gatilho só é mais fácil de medir.

**Mudado em 04/09/2026, por decisão do dono do produto.** O valor era 60.000 — um
minuto de leitura antes de interromper — e essa espera era o **único** argumento
que sustentava a exceção à F063 (ver a seção seguinte). Com zero, o argumento
deixa de existir: a oferta chega antes do conteúdo, e isso passa a ser a decisão,
não uma consequência.

O que se troca, explicitamente:

- **Ganha-se** exposição — 100% de quem abre vê o convite, inclusive quem sairia
  em dez segundos. Com 60s, só via quem já tinha ficado.
- **Perde-se** a ordem "entrega primeiro, pedido depois". A pessoa foi convidada
  por um presente e encontra um pedido de e-mail na frente dele. É o pedágio que
  a F059 e a F063 nomearam e recusaram.

O risco não é hipotético: o Presente é a peça que constrói confiança com tráfego
frio de Instagram, e é o ativo mais caro desta página. Se a leitura do Presente
cair — ou se chegar reclamação —, o número volta. É uma constante, num arquivo.

Ponto técnico: mesmo com zero, o `<article>` **pinta antes**. A modal é client
component e o `useEffect` só roda depois da hidratação, então a pessoa vê o
conteúdo por um instante antes de a modal cobrir. Não é gate de servidor: quem
fecha continua com o Presente inteiro.

### 2. O e-mail é capturado dentro da modal, no fluxo que já existe

A modal renderiza o **mesmo `GiftSignupForm`** do rodapé, com outra copy. Isso não
é economia de código, é correção: o `GiftSignupForm` é quem chama
`authClient.emailOtp` e `completarCadastroPresenteAction`, e é esse par que fecha a
atribuição da F059 — o cookie `bc_origem` está no host, o OTP mantém a pessoa na
**mesma aba**, e o `Membership.origin_utm_content` nasce preenchido.

Um formulário paralelo na modal teria que reimplementar isso e erraria a origem em
silêncio, que é exatamente o modo de falha que a F059 passou uma spec inteira
evitando.

### 2.1. A modal pede só o e-mail

Decidido em 04/09/2026, revertendo o rascunho desta spec, que mantinha nome e
sobrenome obrigatórios. Um campo em vez de três é a alavanca mais barata que
existe no topo do funil, e é lá que o número dói.

`completarCadastroPresenteAction` passa a aceitar nome opcional. Quem não manda
não fica sem identidade: `ensureMemberBootstrap` já resolvia
`displayName: name || email.split("@")[0] || "Membro"` — a pessoa entra como o
trecho antes do `@`.

Dois cuidados que o código precisa ter, e tem:

- **Não mandar `name: ""` para o Better Auth.** String vazia criaria o usuário
  com nome vazio e o fallback do bootstrap perderia a vez. O campo é omitido.
- **Não sobrescrever com vazio na action.** Sem `displayName` montado, ela
  retorna sem escrever, em vez de apagar o que o bootstrap acabou de gravar.

O formulário do **rodapé** continua pedindo nome e sobrenome (`pedirNome`
default `true`): ali a pessoa já leu o Presente inteiro e o atrito de dois
campos custa menos.

Custo assumido: até completar o perfil, a pessoa aparece como `joao.silva` no
feed e nas Conquistas. "Completar o perfil" é o passo 1 da trilha de
Boas-vindas ([F063](F063-funil-presente-conta-free.md#4-trilha-de-boas-vindas-por-tier)),
que é justamente onde ela cai depois de assistir a aula.

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

### 5. A dispensa não é lembrada — cada visita é uma chance nova

Fechar a modal vale para **aquela** visita. Abriu o Presente de novo, a modal volta
a aparecer depois do delay.

O rascunho desta spec guardava a dispensa em `localStorage` por 30 dias. Foi
**retirado por decisão do dono do produto em 04/09/2026**, e o raciocínio é o
funil: 142 visitas geraram 3 cadastros. Quem fecha a modal na primeira leitura e
volta uma semana depois é justamente quem está considerando — silenciar a oferta
por 30 dias desperdiça a segunda visita, que costuma ser a que converte.

O que se perde: quem já decidiu que não quer vai fechar de novo a cada visita. É
um `Esc` por visita, e o conteúdo do Presente continua inteiro atrás.

Consequência técnica boa: some o `localStorage` da feature. Não há mais estado
persistido no navegador, nada a discutir com o gate de consentimento da
[F057](F057-cookies-consentimento.md), e nada a versionar quando a oferta mudar.

Dentro de uma mesma visita o timer roda **uma vez**, na montagem: fechar não
reagenda. Navegação client-side de um Presente para outro remonta o componente e,
por isso, conta como visita nova — que é exatamente a regra pedida.

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
| `src/lib/presentes/popup-aula.ts` | novo — copy, href e delay |
| `src/lib/presentes/popup-aula.test.ts` | novo — copy por número de aulas e destino |
| `src/app/presentes/presente-aula-popup.tsx` | novo — a modal |
| `src/components/gift-signup-form.tsx` | ganha `redirectTo`, `formId` e `pedirNome`; links legais em aba nova |
| `src/components/login-form.tsx` | links legais em aba nova (mesmo motivo) |
| `src/actions/gifts.ts` | nome vira opcional; sem nome, não sobrescreve o fallback |
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
  de forma: `Esc` fecha e o artigo continua inteiro atrás. **Com delay 0 a
  mitigação por tempo desapareceu** — não há mais leitura antes da interrupção.
  Se a leitura do Presente cair ou chegar reclamação, o gatilho volta a subir
  (60s era o valor anterior) ou a feature sai.
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
- [x] A feature não persiste nada no navegador
- [x] E-mail capturado dentro da modal, pelo `GiftSignupForm`
- [x] Um `GiftSignupForm` por vez no DOM tem id único (`formId`)
- [x] A modal pede **só o e-mail**; o rodapé segue pedindo nome e sobrenome
- [x] Cadastro sem nome não grava `displayName` vazio (fallback do bootstrap)
- [x] Termos e Política aparecem na modal — vêm com o `GiftSignupForm`
- [x] Cadastro pela modal cria conta com `displayName` = trecho antes do `@`
- [x] Cadastro pelo formulário do rodapé continua caindo em Boas-vindas
- [x] Quem já tinha conta vê a mensagem de sempre, sem redirecionar
- [x] `npx tsc --noEmit` limpo
- [x] `npm test` verde — 103 testes, 10 desta feature
- [x] `npm run build` compila
- [x] Modal abre depois do delay e captura o e-mail
- [x] OTP chega no e-mail informado dentro da modal
- [x] Cadastro novo pela modal cai em `/aulas/fase-1-m01-comece-por-aqui/aula-introducao-builders-club`
- [x] Origem do Presente (`origin_gift_slug`) gravada pelo cadastro da modal
- [x] `POPUP_DELAY_MS` em `0` — abre na hidratação (era 60.000; 10.000 no QA)
- [ ] Conferir se a modal não aparece antes de o `<article>` pintar
- [x] Termos e Política abrem em aba nova, sem custar o e-mail digitado
- [x] Preview / HML antes de produção
- [ ] Fecha com Esc, X, clique no fundo e "Agora não"
- [ ] Fechar e recarregar a página faz a modal voltar
- [ ] Foco entra na modal e volta ao fechar; scroll do fundo trava e destrava
- [ ] Conferido no tema claro e escuro, mobile (390px) e desktop (1280px)
- [ ] `origin_utm_content` por link **com** UTM no path — o teste de 04/09 usou
      `/presentes/eu-quero-26-08-2026` sem o segmento, então gravou só o slug

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

### Cadastro ponta a ponta em HML — 04/09/2026

Percorrido pelo dono do produto: modal → e-mail → código no e-mail → caiu na
aula. O que o banco de HML mostra desse cadastro:

| Campo | Valor | O que prova |
|---|---|---|
| `user.name` | *(vazio)* | o campo não foi mandado ao Better Auth (decisão 2.1) |
| `profile.displayName` | `cadu.hd+teste12` | o fallback do bootstrap agiu |
| `membership.tier` | `free` | F041 |
| `origin_gift_slug` | `eu-quero-26-08-2026` | a atribuição da F059 sobreviveu à modal |
| `legal_acceptance.ip` | `177.94.46.68` | **a correção da F058 funciona** |
| `legal_acceptance.user_agent` | UA real | idem |

As duas últimas linhas são a prova em runtime da correção registrada na
[F058](F058-registro-aceite-legal.md#correção--04092026-aceite-nascia-sem-ip-e-sem-user-agent):
antes de 04/09 esse mesmo cadastro gravaria `NULL` nos dois campos.

`origin_utm_content` saiu `null`, e está correto: o teste abriu
`/presentes/eu-quero-26-08-2026`, sem o segmento de `utm_content` no path. O
slug foi capturado; o `utm_content` só existe quando o link traz um, como nos
DMs do Instagram.

- **Falta:** o que só o navegador responde e não estava no caminho do teste —
  Esc, X, clique no fundo, foco, scroll travado, os dois temas e o mobile.
