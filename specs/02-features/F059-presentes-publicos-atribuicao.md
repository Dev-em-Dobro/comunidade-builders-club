# F059 — Presentes públicos + atribuição por post

## Status
Em implementação — 2026-08-25 · ADR-009

Depende de: F041 (tiers), F048 (primeiro login), F002 (auth), F020 (LGPD).
Não altera o comportamento de nenhuma delas — ver "Specs afetadas".

## Objetivo
Permitir que uma pessoa **sem conta** leia um Presente vindo do Instagram, e
registrar **de qual post ela veio** quando se cadastrar.

Hoje o Builders Club não tem nenhuma superfície deslogada: todo o grupo
`src/app/(app)/` passa por `requireActiveMemberOrRedirect()`
(`src/app/(app)/layout.tsx:14`) e o `middleware.ts` protege `/`, `/spaces/*`,
`/posts/*` e o resto. Só `/login`, `/termos` e `/privacidade` são públicas.

## Contexto

A Dev em Dobro divulga "presentes" no Instagram. Hoje o fluxo é: a pessoa
comenta uma palavra-chave no post, a automação manda um **link do Notion** no
direct. O Notion não mede nada — não dá para saber qual post gerou qual
cadastro.

A mudança: o link passa a apontar para o Builders Club. A pessoa lê o presente
sem conta e, se quiser os demais presentes e os artigos da comunidade, cria a
conta ali mesmo.

**A atribuição por post não é recuperável depois.** Cadastro que entrar antes
disso existir entra sem origem, e a data do cadastro não diz de qual post veio.
Essa é a razão da prioridade.

## Fluxo detalhado

```
1. Post no Instagram
   └─ pessoa comenta a palavra-chave

2. Admin publica o presente no space Presentes (slug, ex. agent-reach).
   Admin → Presentes gera o link (presente + nome da postagem + data).
   Automação / Jaque envia no DM:
   https://<domínio>/presentes/agent-reach/eu-quero-22-09-2026
   (equivale a /presentes/agent-reach?utm_source=instagram&utm_medium=dm
    &utm_campaign=presentes&utm_content=eu-quero-22-09-2026)

3. Abre no NAVEGADOR INTERNO DO INSTAGRAM (webview)
   └─ GET /presentes/agent-reach/...  → rota PÚBLICA, sem sessão
      ├─ grava GiftVisit (utm_* + slug + referrer + createdAt)
      │  └─ só se NÃO for bot (ver "Filtro de bot")
      └─ seta cookie bc_origem, first-touch (só se ainda não existir)

4. Pessoa lê o presente (conteúdo completo, sem cadeado)
   └─ sem comentários, sem reações, sem sidebar do app

5. CTA: "Crie sua conta e pegue os outros presentes"
   └─ abre formulário INLINE, na mesma página — sem redirect

6. Formulário: nome, sobrenome, e-mail
   └─ POST → envia código de 6 dígitos por e-mail

7. Tela de código, MESMA ABA
   ⚠️ Aviso obrigatório: "Não achou? Olhe em spam e em promoções."
   └─ pessoa troca de app só para LER o código e volta

8. Digita o código → POST de verificação
   ├─ Better Auth cria o User
   ├─ databaseHooks.user.create.after (auth/index.ts:52)
   │  └─ ensureMemberBootstrap() cria o Membership
   │     └─ CARIMBA A ORIGEM AQUI  ← o ponto que fecha o funil
   │        (cookie bc_origem + slug do presente, ambos disponíveis)
   └─ Server Action grava Profile.displayName = "nome sobrenome"

9. Página recarrega logada, no MESMO presente
   └─ faixa no topo: "Acesse Boas-vindas para ver o resto do conteúdo"

10. Menu "Presentes" passa a aparecer — os demais presentes liberados
```

### Por que o cadastro é OTP e não Google ou magic link

O passo 3 é o motivo. No webview do Instagram, Google OAuth é recusado pelo
provedor e o magic link cria a conta em **outro navegador** — onde o cookie
`bc_origem` não existe, então a origem grava `null` mesmo para quem volta.
Decisão e alternativas em **ADR-009**.

## Rotas e superfícies

| Rota | Acesso | Observação |
|------|--------|------------|
| `/presentes/[slug]` | **público** | um presente por vez. Fora de `(app)`, sem `AppShell`. UTMs na query |
| `/presentes/[slug]/[utmContent]` | **público** | mesmo presente; UTM no path (link que a Admin gera para o DM) |
| `/spaces/presentes` | logado (free+) | lista de todos os presentes — é o que a conta destrava |

Um presente é público **apenas** quando está no space `presentes` **e** tem
`slug` preenchido. O `slug` é o opt-in explícito de publicação.

**Regra de segurança:** a rota pública consulta por `slug` **e** valida o space.
Nunca por `id` solto — senão vira leitura anônima de qualquer post do app.

Não confundir as duas superfícies: `/presentes/[slug]` é anônima e serve **um**
presente; `/spaces/presentes` é logada e lista **todos**. A diferença entre as
duas é o incentivo de conversão.

## Modelo de dados

```prisma
model Post {
  // F059 — presente publicável: slug preenchido = leitura pública liberada.
  slug String? @unique
}

model Membership {
  // F059 — origem do cadastro. Gravado SÓ na criação, nunca em update.
  originUtmContent String?   @map("origin_utm_content")
  originGiftSlug   String?   @map("origin_gift_slug")
  originAt         DateTime? @map("origin_at")
}

/// F059 — chegada anônima em um presente, com UTM. Uma linha por visita.
model GiftVisit {
  id           String   @id @default(cuid())
  giftSlug     String   @map("gift_slug")
  utmSource    String?  @map("utm_source")
  utmMedium    String?  @map("utm_medium")
  utmCampaign  String?  @map("utm_campaign")
  utmContent   String?  @map("utm_content")
  referrer     String?
  createdAt    DateTime @default(now())

  @@index([utmContent, createdAt])
  @@index([giftSlug, createdAt])
  @@map("gift_visit")
}
```

**Sem IP, nem cru nem hasheado** — não é necessário para contar por post, e
evita discussão de LGPD (F020).

`PostView` (`schema.prisma:234`) exige `userId` não-nulo, então leitura anônima
**não** entra no `viewCount` do post. A contagem de leitor anônimo sai de
`GiftVisit`. Isso é intencional, não bug.

## Atribuição

### Cookie `bc_origem`
- Setado no GET de `/presentes/[slug]` (e no path com UTM). Sem `utm_content`
  ainda grava o **slug do presente** — senão `/presentes/foo` cria conta e some
  do relatório
- Com UTM (query ou `/presentes/[slug]/[utmContent]`), grava os dois
- `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, ~90 dias
- **First-touch**: só escreve se ainda não existir. Se a pessoa abrir três
  presentes antes de se cadastrar, o crédito é do primeiro.
- Cobre quem lê hoje e volta para se cadastrar depois

### Gravação
No ramo de **criação** do Membership (`src/lib/membership/bootstrap.ts:66-75`):

- `originUtmContent` ← cookie `bc_origem`
- `originGiftSlug` ← slug do presente
- `originAt` ← agora

Grava as duas informações. Se o mesmo presente for divulgado em mais de um post,
só o `utm_content` distingue; se for um post por presente, o slug é uma
redundância que sobrevive à perda do cookie.

**Nunca gravar em update.** Sobrescrever em login posterior faz a contagem de
cadastros por post mudar sozinha semanas depois. Membership que já existe
(pessoa que só logou) não recebe carimbo.

### Marco zero
Cadastros anteriores ao go-live não têm origem e **não são recuperáveis**. O
relatório deve filtrar por `originAt IS NOT NULL`, nunca tratar `null` como
"origem desconhecida" — são coisas diferentes.

## Filtro de bot — obrigatório

Quando a automação envia o link no direct, o Meta faz **unfurl para gerar o
preview**, o que dispara um GET na página **por DM enviada, sem clique humano**.

Sem filtro, o número resultante é plausível e errado: visitas ≈ DMs enviadas,
conversão baixa mas crível. Ninguém desconfia.

Descartar por user-agent (`facebookexternalhit`, `Instagram`, bots conhecidos)
antes de gravar `GiftVisit`. Vale desde o primeiro dia.

O Instagram também acrescenta `igshid=` na URL — parâmetro desconhecido deve ser
ignorado, nunca quebrar a página.

## Convenção de UTM

| Parâmetro | Valor | Por quê |
|-----------|-------|---------|
| `utm_source` | `instagram` | de onde veio |
| `utm_medium` | `dm` | como chegou — distingue de bio, stories |
| `utm_campaign` | `presentes` | a iniciativa, para comparar com outras depois |
| `utm_content` | `<nome>-<DD-MM-AAAA>` | **o post específico** — é o que fecha o funil |

`utm_content` usa o **nome da postagem + data** (ex.: `eu-quero-22-09-2026`).
A Admin gera isso para a Jaque copiar. Query string com os quatro UTMs também
vale — o path curto é só conveniência.

## Link do presente (Notion ou outro)

O título legível continua sendo extraído do slug do Notion (sem UUID, sem
`fbclid`) por `giftLinkView`, e vira o `<h1>` da página.

O link sai pelo `PostMedia`, como em qualquer post: uma linha compacta com a
URL e `target=_blank`.

### Card "Abrir presente" — removido

> **Removido em 27/08/2026.** O card repetia o `<h1>` da página logo abaixo do
> corpo: com `showComposerTitle = true` (o caso de todos os presentes reais),
> o título aparecia duas vezes na mesma tela.

Consequências registradas:

- O `<h1>` **sempre** fica visível. Antes, presente com link e sem título de
  composer caía em `title = null` e o `<h1>` virava `sr-only`, porque o card
  já mostrava o título. Sem o card, isso deixaria a página sem título.
- O `PostMedia` volta a receber `gift.linkUrl` (o card suprimia com
  `linkUrl={link ? null : gift.linkUrl}`). Sem isso, presentes cujo `linkUrl`
  **não** aparece no corpo ficariam sem link — em 27/08/2026 esse era o caso de
  4 dos 6 presentes em produção (`whisper-local`, `hermes` e os dois de teste).

### Popup ao voltar — removido junto

O popup de "Já leu o presente?" vivia dentro do `GiftOpenCard` e era armado
pelo clique **no card**. Sem card, não há clique para armar, então saiu junto.

O `GiftSignupForm` inline continua sendo o caminho de conversão da página.
Recuperar o componente: `git show <commit>^:src/components/gift-open-card.tsx`.
[F063](F063-funil-presente-conta-free.md) planejava reaproveitar esse popup
trocando a copy — se for retomado, precisa de um novo gatilho.

## Cadastro — regras de tela

- Formulário **inline** na página do presente. Cada navegação é chance de perder
  a pessoa e o contexto.
- Campos: nome, sobrenome, e-mail.
- Na tela de código, **avisar para procurar em spam e em promoções**. A pessoa
  está parada esperando; um e-mail que não aparece na caixa de entrada mata a
  conversão no ponto exato da conversão.
- `Profile.displayName` = `"<nome> <sobrenome>"`, gravado por Server Action
  depois de a sessão existir. O plugin OTP cria o usuário só com e-mail, e
  `bootstrap.ts:59` cairia no prefixo do e-mail como fallback.
- E-mail que **já tem conta**: `disableSignUp: false` faz o mesmo endpoint
  logar em vez de cadastrar. A UI precisa dizer isso ("você já tem conta,
  entramos com ela") — e nesse caso **não** carimbar origem.

## Space Presentes

- `PRESENTES_SPACE_SLUG = "presentes"` em `src/lib/spaces/constants.ts`
- Entra em `FREE_SPACE_SLUGS` (`src/lib/membership/capabilities.ts`) —
  **sem isso a pessoa cria a conta para pegar os outros presentes e recebe
  cadeado + popup de upgrade exatamente no que foi prometido no Instagram**
- Entra em `ADMIN_ONLY_PUBLISH_SLUGS` — só admin publica
- Entra em `COMMENTS_DISABLED_SPACE_SLUGS`, como Boas-vindas
- **Não** entra no feed global — o catálogo é `/spaces/presentes`

## Faixa de Boas-vindas

Depois do cadastro, faixa no topo da página do presente chamando para
`/spaces/boas-vindas`.

Não há conflito com F048: o redirect de primeiro acesso dispara em `/` (feed), e
a pessoa não passa por lá. F048 já documenta isso como aceitável
(`F048:20-21` — callback explícito não força Boas-vindas na sessão).
`welcomeSeenAt` é marcado normalmente quando ela abrir Boas-vindas.

## Métrica

O funil tem quatro degraus, e as duas primeiras pontas já existem na ferramenta
de automação:

```
comentários no post → DMs enviadas → visitas no presente → cadastros
     (Instagram)      (automação)        (GiftVisit)      (Membership)
```

- **DM enviada vs. visita** → o problema é o post ou o link
- **visita vs. cadastro** → o problema é a página do presente

Medir só cadastro esconde o diagnóstico: post que traz muito leitor e pouco
cadastro é problema da página, não do post.

Admin → aba Presentes mostra visitas, cadastros, pessoas e
`assinou_plano_veio_de_uma_postagem`: membro **pago agora** (PRO/Elite/`paid`)
**e** origem daquele post. Admin/instrutor não conta. Não é coluna no banco.

A compra é F014 (Hubla: `invoice.payment_succeeded` / `subscription.activated`
além de `member_added`) e F047 (TMB). O webhook **só** muda `status` + `tier`.
Não regrava origem. Login não promove free.

Não há data da compra Hubla na tela — só o plano de agora.

## Critérios

- [x] `/presentes/[slug]` abre sem sessão, fora de `(app)` (matcher só seta cookie, sem login)
- [x] `/presentes/[slug]/[utmContent]` abre o mesmo presente com origem no path
- [x] Rota consulta por `slug` **e** valida o space — post de outro space não
      vaza
- [x] Post sem `slug` não é publicamente acessível
- [x] Visita com UTM grava `GiftVisit`
- [x] Request de bot (`facebookexternalhit`, crawler Instagram sem Mozilla)
      **não** grava
- [x] `igshid` e parâmetros desconhecidos não quebram a página
- [x] Cookie `bc_origem` é first-touch — segunda visita não sobrescreve
- [x] `/presentes/[slug]` sem UTM ainda carimba `originGiftSlug` no cadastro
- [x] Cadastro por OTP na mesma aba cria a conta
- [x] Tela de código avisa sobre **spam e promoções**
- [x] `Membership` novo grava `originUtmContent`, `originGiftSlug` e `originAt`
- [x] Login de membro **existente** não altera a origem
- [x] `Profile.displayName` recebe nome + sobrenome
- [x] Free abre `/spaces/presentes` sem cadeado
- [x] Faixa de Boas-vindas aparece no presente após o cadastro
- [x] URL do Notion (ou outro http) vira card com título legível + abre em nova aba
- [x] Ao voltar da aba do presente, popup convida a criar a conta (só deslogado)
- [x] Admin → aba Presentes gera `/presentes/{slug}/{nome}-{DD-MM-AAAA}`
- [x] Admin → aba Presentes: visitas, cadastros, lista de pessoas e quem
      assinou plano pago (`tier` pro/elite/paid + origem daquele post)
- [x] Free que compra depois (Hubla/TMB) vira PRO/Elite **sem** perder origem;
      a coluna `assinou_plano_veio_de_uma_postagem` passa a **sim**
- [ ] Testado **no celular, dentro do Instagram**, ponta a ponta: DM → leitura →
      cadastro → origem no banco

## Fora de escopo

- Data exata da compra Hubla/TMB (aqui o pago é o **tier atual** com origem
  daquele post — `assinou_plano_veio_de_uma_postagem`)
- Fluxo de reset de senha (não há senha — ADR-009)
- Comentários e reações na leitura anônima
- Migrar os presentes que hoje estão no Notion

## Specs afetadas

| Spec | Mudança |
|------|---------|
| **ADR-009** | novo — OTP como método de auth |
| **F002** | acrescentar OTP aos métodos de login |
| **F014** | pagamento Hubla também promove o free que já tem conta |
| **F041** | `presentes` entra em `FREE_SPACE_SLUGS`; login não promove free |
| **F048** | nenhuma — `F048:20-21` já cobre o caso |
| **F020** | cookie de atribuição e `GiftVisit` entram na política de privacidade |
| **01-domain-model** | termo novo: **Presente** |

## Bloqueio externo — ✅ resolvido em 04/09/2026

**O host de produção é `comunidade-builders-club.devemdobro.com`.** Quem estava
certo eram os webhooks e o `scripts/perf-lighthouse.mts:23`.

O `builders-club.devemdobro.com` do `README.md` e do `docs/deploy-vercel.md` não
é este app: é uma landing estática, de outro projeto Vercel, que responde **404**
em `/login`, `/planos`, `/presentes/<slug>` e no webhook da Hubla. Os dois docs
foram corrigidos; a tabela de evidência está em
[`docs/deploy-vercel.md`](../../docs/deploy-vercel.md#verificação-dos-domínios--04092026).

O texto original do bloqueio, para memória do que motivou a checagem:

> O repositório tem dois e eles discordam: `README.md:10` e
> `docs/deploy-vercel.md:8` dizem `builders-club.devemdobro.com` (e é para lá que
> apontam `BETTER_AUTH_URL` e o callback do Google), enquanto os webhooks
> (`deploy-vercel.md:69`) e `scripts/perf-lighthouse.mts:23` usam
> `comunidade-builders-club.devemdobro.com`.

O cookie de origem é setado no host que a pessoa acessa. Se ela chega em um host
e o cadastro roda no outro, **o cookie fica no host errado e a origem morre em
silêncio**, com a UTM aparentemente funcionando. Se um redireciona para o outro,
confirmar também que a query string sobrevive ao 302.

Link errado configurado na automação e divulgado no Instagram não tem volta.
