# F063 — Do presente à conta: promessa visível e prova para o free

## Status
Rascunho — 2026-08-27

## Contexto

O funil de presentes ([F059](F059-presentes-publicos-atribuicao.md)) já entrega
valor real antes do cadastro e já mede origem por post. O que falta é o passo
seguinte: a pessoa lê o presente, gosta, e **não descobre o que é o Club nem
para que ele serve**.

Esta feature não cria conteúdo novo. Ela torna visível a promessa que já existe
no código e destranca a prova que já existe no banco.

## O problema, medido no presente do Elevator Saga

Percurso real de `/presentes/saga` (título "O kit do Elevator Saga: o link do
jogo, os comandos e o esqueleto pra colar", `play.elevatorsaga.com`, corpo de
8.877 caracteres, atualizado em 27/08/2026).

`giftLinkView` resolve `showComposerTitle = true` e `showBody = true`, então
`presente-publico.tsx` renderiza, de cima pra baixo: eyebrow **BUILDERS CLUB** ·
Presentes → título → autor e data → filete → corpo em markdown → card "Abrir
presente" → formulário de cadastro.

### 1. A página não diz a promessa

As palavras **cliente**, **90 dias**, **agência**, **automação** e **IA** não
aparecem em nenhum ponto de `presente-publico.tsx`. A única razão oferecida para
criar conta é ganhar mais presentes:

- `gift-signup-form.tsx` — "Crie sua conta e pegue os outros presentes"
- `gift-open-card.tsx` — "Já leu o presente? Crie sua conta grátis nesta página
  e pegue os outros presentes da comunidade."

Ela sai sabendo que o Dobro dá coisa boa de graça. Não sabe que existe um
método, um objetivo ou sequer o que é o Builders Club.

A promessa existe: `PROMESSA_PRIMEIRO_CLIENTE` em
`src/lib/membership/checkout.ts`. Ela só é renderizada dentro de `/planos`.

### 2. A oferta é invisível para quem não tem conta

> ✅ **Resolvido em 27/08/2026** — ver [Implementado](#implementado-em-27082026--decisões-que-o-rascunho-não-previa).

`/planos` **vivia** em `src/app/(app)/planos/`, e `src/app/(app)/layout.tsx`
chama `requireActiveMemberOrRedirect()`. Uma visitante anônima era mandada para
o login. **Ela precisava criar conta para descobrir por que criaria conta.**

O `middleware.ts` **já libera** `/planos` — `isProtectedPath` não o lista. O
bloqueio é só do layout do segmento `(app)`.

### 3. A trilha do primeiro dia é 4/5 bloqueada

Depois do cadastro ela vê "Conta criada. Acesse Boas-vindas para ver o resto do
conteúdo." Em Boas-vindas, o card "Primeiros passos"
(`welcome-space-view.tsx`) é o mesmo para free e pago:

| Passo | Destino | Free |
|---|---|---|
| 1. Completar o perfil | `/perfil` | abre |
| 2. Assistir as aulas | `/aulas` | **bloqueado** |
| 3. Postar na comunidade | `/spaces/conquistas` | **bloqueado** |
| ↳ "Dúvida no space Dúvidas" | `/spaces/duvidas` | **bloqueado** |
| ↳ "vitória em Conquistas" | `/spaces/conquistas` | **bloqueado** |

O primeiro checklist que ela lê como membro tem 4 de 5 links fechados. Lido de
fora, parece isca.

### 4. A prova existe e está trancada

O space **Conquistas** é descrito no seed como "cliente fechado, proposta
aceita, ou primeiro pagamento. Conte como foi o processo pra fechar a venda".
É exatamente a evidência de que a promessa dos 90 dias acontece — e não está em
`FREE_SPACE_SLUGS`.

Nota importante para dimensionar o risco: pela vitrine do F041
(`canFreeReadPost`), o membro free **já lê** posts de Conquistas quando eles
aparecem no Feed. O que falta é a **página do space** — a visão curada. Liberar
o space não expõe nada novo a quem já tem conta.

## O que ela quer

A escada de perguntas de quem chega pelo presente:

1. *Isso é útil?* — o presente já responde, e responde bem
2. *Essas pessoas sabem do que falam?* — o corpo do presente responde
3. *Isso dá dinheiro ou é só hobby?* — **nada responde**
4. *Alguém como eu conseguiu?* — **nada responde** (Conquistas está trancado)
5. *Quanto custa e o que eu levo?* — **só depois de logar**

Os degraus 3, 4 e 5 são o escopo desta feature.

## Decisões

### 1. Bloco da promessa na página do presente

Novo bloco em `presente-publico.tsx`, **depois** do `<article>` (corpo + card de
abrir + mídia) e **antes** do `GiftSignupForm`. Ele fecha a leitura e abre a
oferta — nunca aparece antes do presente, para não cobrar pedágio por algo que
foi anunciado como presente.

Conteúdo fixo, sem campo novo no banco:

- eyebrow: `Builders Club`
- título: **Isto é uma amostra do que a gente faz**
- corpo: o Club é a comunidade de quem está montando a própria agência de IA e
  automação — aulas, skills prontas, templates de proposta e contrato, e gente
  fechando cliente junto
- destaque: **Feche o 1º cliente em 90 dias** (reusa
  `PROMESSA_PRIMEIRO_CLIENTE`, sem o rótulo "Promessa:", igual à
  [F053](F053-ofertas-pro-elite.md))
- dois CTAs: **Criar conta grátis** (âncora para o formulário na própria
  página) e **Ver os planos** (`/planos`, público pela decisão 2)

Variantes por sessão:

| Quem | O que vê |
|---|---|
| Anônima | bloco completo + formulário |
| Logada free | bloco compacto (promessa + "Ver os planos"), sem formulário |
| Logada paga | nada (já comprou) |

**A razão do cadastro muda.** Sai "pegue os outros presentes", entra a prova
social destravada pela decisão 3:

- `GiftSignupForm` headline: "Crie sua conta e veja quem está fechando cliente"
- subhead: "Conta gratuita. Você entra e lê as conquistas reais da comunidade:
  quem fechou, por quanto e como foi."
- ~~`GiftOpenCard` (modal de volta da aba): mesma troca de razão~~
  ⚠️ **O `GiftOpenCard` foi removido em 27/08/2026** (ver
  [F059](F059-presentes-publicos-atribuicao.md#card-abrir-presente--removido)):
  o card repetia o `<h1>` da página. O modal de volta da aba morava dentro dele
  e era armado pelo clique no card, então saiu junto. Se esta feature for
  retomada, o modal precisa de um novo gatilho — o candidato natural é o clique
  no link do `PostMedia`.

O corpo do presente continua sendo o lugar de fazer a ponte temática (no caso do
Saga: programação orientada a eventos → automação que empresa paga). Isso é
convenção editorial de quem escreve o presente, não campo de sistema.

### 2. `/planos` legível sem conta

`/planos` sai do segmento `(app)` e vira rota pública, com a mesma moldura leve
de `/presentes` (eyebrow do produto + `ThemeToggle`, sem sidebar).

- Anônima: cards PRO e Elite com `currentPlan = "none"`; sem o botão "Abrir
  Orion"; subtítulo usa `UPGRADE_REASON_COPY.geral`
- CTA aponta direto para o checkout Hubla. Isso funciona sem conta: o webhook
  grava em `AllowedEmail` e o tier é concedido no primeiro login com o mesmo
  e-mail (F014/F021/F053)
- Por isso, nota obrigatória sob o CTA para quem está deslogada: **"Compre com o
  e-mail que você vai usar para entrar."** Sem isso a pessoa compra com um
  e-mail e loga com outro
- `?motivo=` e `?destaque=elite` seguem funcionando para quem tem sessão
- Membro logado continua chegando por `hrefPlanos()` e mantém o link "Voltar ao
  feed" que já existe

**Custo aceito:** o membro logado perde a sidebar enquanto está em `/planos`.
É uma página de conversão e já tem link de volta; não vale mexer no
`AppSegmentLayout` para preservar a moldura.

#### Implementado em 27/08/2026 — decisões que o rascunho não previa

O `middleware.ts` **já** liberava `/planos`: `isProtectedPath` nunca listou essa
rota. O gate vinha só do `requireActiveMemberOrRedirect()` no layout de `(app)`.
Mover a pasta foi suficiente — nenhuma mudança de middleware.

Quatro pontos que só apareceram no código:

1. **"Voltar ao feed" quebra para anônima.** O link aponta para `/`, que **é**
   rota protegida. Visitante clicaria e cairia no login — o beco que esta
   feature existe para evitar. O link só renderiza com sessão.
2. **`?motivo=` vazando.** Um `/planos?motivo=aulas` compartilhado mostraria
   para visitante uma copy escrita para quem já está dentro. Anônima ignora
   `motivo` e `destaque` e usa sempre `geral`.
3. **`ensureMemberBootstrap` deixa de rodar em `/planos`.** É ele que cria
   profile/membership no primeiro acesso e grava o aceite legal (F058) com IP e
   user-agent. Segue rodando em todas as outras rotas logadas; `/planos` é a
   única exceção.
4. **Membership `pending`/`revoked` passa a ver a página.** Antes o gate mandava
   para `/aguardando`. **Decidido manter o acesso:** é justamente quem pode
   querer comprar.

A nota do e-mail ficou **sob a grade** de cards, não sob cada CTA.

### 3. Conquistas liberado para leitura do free

> ✅ **Implementado em 27/08/2026 — e ampliado.**
>
> O teste percorrido como free real mostrou que o problema era maior: **5 dos 8
> spaces** tinham cadeado. Como o free não pode publicar em lugar nenhum (o gate
> de publicar é por tier, independente do acesso ao space), trancar a *leitura*
> só escondia a prova de que a comunidade funciona — sem proteger nada.
>
> Entraram em `FREE_SPACE_SLUGS`: `avisos`, `duvidas`, `conquistas`, `projetos`.
> Ficaram de fora `freelas` (indicação é troca entre pagantes) e `aula-threads`
> (conteúdo de aula).
>
> `isFreeSpaceSlug` governa o cadeado da sidebar **e** o gate da página
> (`spaces/[slug]/page.tsx:34`) — a constante resolve os dois.

Adicionar `conquistas` a `FREE_SPACE_SLUGS` (`capabilities.ts`).

- Free **lê** a página do space e os posts
- Free **não** publica nem comenta fora de `projetos`, e não reage — os
  gates de `publicar` / `comentar` / `reagir` continuam PRO+ **exceto**
  Desafio Projetos (F065: publicar e comentar só nesse space)
- O composer não aparece para free (não deve renderizar e falhar no submit)

É o "ver o que a comunidade tá fazendo" que justifica o cadastro na decisão 1.

### 4. Trilha de Boas-vindas por tier

`WelcomeSpaceView` passa a receber `isPaid` e escolher a lista de passos. Nenhum
passo pode apontar para rota bloqueada no tier de quem está lendo.

Free (F065 — Comece por aqui liberado; nenhum href cadeado):

1. **Completar o perfil** → `/perfil`
2. **Assistir as primeiras aulas** → `/aulas`
3. **Ver o que a comunidade está fechando** → `/spaces/conquistas`
4. **Pegar os outros presentes** → `/spaces/presentes`

Pago: mantém os três passos atuais (perfil, aulas, postar).

> ✅ **Implementado em 27/08/2026**, com um desvio no passo 3.
>
> O rascunho mandava para `/planos`. Trocado por `/spaces/presentes` porque
> "Primeiros passos" é onboarding, não pitch: colocar a página de preço como
> terço do primeiro dia inverte a lógica de **prova antes de oferta** que o
> resto desta feature defende. `/spaces/presentes` é ação que o free executa,
> entrega valor imediato e cumpre a promessa que o trouxe até aqui.
>
> O empurrão de upgrade continua previsto — mas como **faixa própria** na tela
> de Boas-vindas (ver Pendente), separada da trilha.

O vídeo tutorial já varia por tier (`welcomeTutorialVideoId`); só a lista muda.

## Pendente — levantado no teste de 27/08/2026

Percorrido como usuário free real. O roteiro do teste e o do vídeo ficam
**fora do repositório** (`docs/roteiro-*.md`, no `.gitignore`): citam ambiente
de homologação e qual e-mail recebe admin no bootstrap, e este repositório é
**público**.

- [ ] **Preço do PRO desatualizado em produção.** Mudou de 6× para 12× de
      R$ 30,18, mas `checkout.ts:79-81` ainda tem `installments: 6` /
      `"R$ 55,18"`. Falta confirmar o valor **à vista** antes de mexer aqui e na
      [F053](F053-ofertas-pro-elite.md). 12 × 30,18 = R$ 362,16 — se o à vista
      seguir R$ 297, o acréscimo sobe de 11,5% para 22%, e a regra de **não**
      dizer "sem juros" continua valendo.
- [ ] **Faixa de upgrade na tela de Boas-vindas** para quem é free — separada da
      trilha, que é onboarding.
- [ ] **Copy dos modais de upgrade.** Avaliada como "70% boa": diz o que a
      pessoa não pode mais do que o que ela ganha.
- [ ] **Texto de contexto antes do formulário** na página do presente — o que é
      o Club e por que criar conta, hoje ausente.
- [ ] **E-mail do código OTP sem contexto** — chega só com o código, sem dizer
      por que entrar na comunidade.
- [x] **Playlist de aulas gratuitas** para o free — [F065](F065-aulas-fase-1-free.md)
      (só o Comece por aqui; catálogo com cadeado no restante).
- [ ] **Regravar o vídeo de boas-vindas do free** — roteiro no doc local (ver
      acima). Trocar `WELCOME_TUTORIAL_VIDEO.freeVideoExternalId` depois de
      subir no Panda.

## Fora de escopo

- Skill gratuita / Fase 2. Aula da Fase 1 para o free: [F065](F065-aulas-fase-1-free.md).
- Mudança de preço, de checkout ou de webhook
- Indexação pública de Conquistas — o space continua exigindo conta; free não é
  público
- Conteúdo novo de qualquer tipo

## Riscos

- **Audiência de Conquistas.** Quem postou faturamento lá escreveu para uma
  plateia paga. A exposição real não muda (o Feed já entrega esses posts ao
  free desde o F041), mas a percepção sim. Vale um aviso no space antes de
  ligar.
- **Compra com e-mail errado.** Abrir `/planos` para anônimas cria um caminho de
  compra sem conta. A nota de e-mail na decisão 2 é obrigatória, não cosmética.
- **Bloco da promessa virar anúncio.** Se ficar longo ou aparecer antes do
  conteúdo, queima a boa vontade que o presente construiu. Ele fecha a página,
  não interrompe a leitura.

## Critérios de aceitação

- [ ] Spec antes do código
- [ ] `/presentes/saga` mostra a promessa dos 90 dias e o que é o Club, depois
      do conteúdo e antes do formulário
- [ ] Cadastro na página do presente é oferecido pela prova social, não por
      "mais presentes" (formulário e modal de volta da aba)
- [ ] Bloco tem três variantes: anônima, logada free, logada paga
- [x] `/planos` abre deslogada, sem redirecionar para login
- [x] `/planos` deslogada mostra a nota "Compre com o e-mail que você vai usar
      para entrar" — **sob a grade**, não sob cada CTA (são dois cards lado a
      lado; a nota repetida polui e uma nota cobre os dois)
- [x] `/planos` logada mantém `?motivo=`, `?destaque=elite` e "Voltar ao feed"
- [x] `/planos` deslogada **ignora** `?motivo=` e `?destaque=`, caindo em
      `UPGRADE_REASON_COPY.geral`
- [x] `/planos` deslogada **não** mostra "Voltar ao feed"
- [x] `/planos` tem `metadata` (title, description, OG)
- [x] Free abre `/spaces/conquistas` e lê os posts
- [x] Free não vê composer em Conquistas; comentar e reagir seguem no gate PRO
- [x] "Primeiros passos" do free não tem nenhum link bloqueado
- [x] "Primeiros passos" do pago continua como está
- [x] Cadastro pelo presente leva direto para `/spaces/boas-vindas`
- [ ] Métrica do F059 (cadastro por post de origem) comparada antes/depois
- [ ] Preview only (sem migration nesta feature)
