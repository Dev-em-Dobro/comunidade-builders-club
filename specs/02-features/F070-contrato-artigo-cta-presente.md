# F070 — Contrato do Presente: o Dobro escreve o artigo, o Club escreve o CTA

## Status
Em implementação — 2026-08-31

Depende de: [F059](F059-presentes-publicos-atribuicao.md) (Presente público),
[F063](F063-funil-presente-conta-free.md) (bloco da promessa),
[F067](F067-copy-do-ganho-free.md) (copy entregue).
**Não altera o comportamento de nenhuma delas** — ver "O que esta feature
não muda".

## Objetivo

Fixar de quem é cada metade da página do Presente:

| Metade | Dono | Onde vive |
|---|---|---|
| **Texto do artigo** — o conteúdo do Presente | Dev em Dobro (editorial) | `Post.body`, markdown, escrito fora do código |
| **CTA final** — promessa, oferta e cadastro | Projeto da comunidade (código) | `presente-promessa.tsx` + `gift-signup-form.tsx` |

A regra em uma frase: **o corpo do Presente termina no assunto; tudo que
vem depois dele é do app.**

## Contexto

O Presente é um Post do space `presentes` com `slug`
([domínio](../01-domain-model.md)), lido sem conta em `/presentes/[slug]`.
O corpo é markdown que a Dev em Dobro escreve por fora e cola no composer —
o campo de slug só aparece para admin no space Presentes
(`composer.tsx:47`), e o valor entra pelo formulário
(`actions/posts.ts:37`).

Do `</article>` para baixo, quem manda é o código
(`presente-publico.tsx:186-197`):

```
<article>  corpo em markdown + PostMedia   ← Dobro
</article>
<PresentePromessa>  promessa + oferta       ← Club
<GiftSignupForm>    cadastro                ← Club
```

Nada hoje impede que o corpo traga o seu próprio CTA no último parágrafo.
Quando traz, a página fecha duas vezes — e a segunda contradiz a primeira.

## O problema

Um CTA escrito dentro do markdown é **estático**. Ele não sabe quem está
lendo, e a página inteira abaixo dele sabe:

1. **Fala com a pessoa errada.** "Crie sua conta grátis" no fim do texto
   aparece igual para quem já tem conta. Pior: aparece para quem já é
   pagante — exatamente a leitora para quem o app decidiu **não** mostrar
   oferta nenhuma (`!isPaid`, `presente-publico.tsx:186`).
2. **Duplica o bloco do app.** O `PresentePromessa` vem logo abaixo. Dois
   fechamentos seguidos, com palavras diferentes para o mesmo pedido,
   queimam a boa vontade que o Presente construiu — o risco que a
   [F063](F063-funil-presente-conta-free.md#riscos) já nomeia.
3. **Envelhece sozinho.** Preço e promessa digitados à mão divergem do
   `checkout.ts`, que é a fonte única desde a
   [F069](F069-faixa-upgrade-boas-vindas.md#3-o-que-diz). O PRO mudou de 6×
   para 12× de R$ 30,18 e a correção custou **uma linha, em um arquivo**
   (`checkout.ts:79-80`). Escrito nos corpos, o mesmo preço estaria errado
   em todos os Presentes já publicados — sem ninguém saber quais.
4. **Perde a medição.** Link para `/planos` ou para o checkout escrito no
   texto não passa por `hrefPlanos({ motivo })`. Some o único gancho que
   separa "veio do Presente" de "veio de um cadeado"
   ([F069, decisão 4](F069-faixa-upgrade-boas-vindas.md#4-rastro-de-origem)).

## Decisões

### 1. A fronteira

O último parágrafo do corpo é sobre **o assunto do Presente**, não sobre o
Builders Club. O artigo entrega o que prometeu e para.

Continua sendo trabalho do Dobro — e não muda:

- a **ponte temática**, já prevista na
  [F063](F063-funil-presente-conta-free.md#1-bloco-da-promessa-na-página-do-presente)
  ("no caso do Saga: programação orientada a eventos → automação que
  empresa paga"). Ponte é sobre o tema levar a algum lugar; não é pedido de
  cadastro
- links do próprio assunto (documentação, repositório, ferramenta)
- o `linkUrl` do Presente, que sai pelo `PostMedia` dentro do `<article>`
- título, imagem e vídeo

### 2. O que o corpo não contém

Lista fechada e **verificável por máquina** — o texto não depende de
julgamento a cada Presente, e a regra não depende de alguém lembrar dela:

| Regra | O que casa | Por que não pega demais |
|---|---|---|
| `link-conversao` | link para `/planos`, `/cadastro` ou `/login` — caminho relativo ou no domínio do Club | o mesmo caminho em **outro** host não casa: um tutorial pode citar o `/login` de outra ferramenta |
| `checkout` | qualquer URL em `pay.hub.la` ou `pay.tmb.com.br` | são hosts de checkout; não há uso legítimo dentro de um artigo |
| `preco-do-produto` | os preços de `ofertaPro()` e `ofertaElite()` — hoje `R$ 30,18`, `R$ 297`, `R$ 101,30`, `R$ 997`, `R$ 1.297` | casa o **preço do produto**, não "R$" em geral — o Presente fala de quanto cobrar do cliente o tempo todo |
| `promessa-do-produto` | `PROMESSA_PRIMEIRO_CLIENTE` e a variante "cliente em 90 dias" | a promessa tem um dono só: `checkout.ts` |
| `pedido-de-cadastro` | imperativo de 2ª pessoa dirigido à leitora — "crie sua conta", "cadastre-se", "faça seu cadastro", "assine o PRO", "entre no Club", "garanta sua vaga" | casa o pedido, não a menção |

Preço e promessa são lidos de `src/lib/membership/checkout.ts` em tempo de
execução. Mudou o preço lá, a detecção acompanha — sem lista paralela para
esquecer de atualizar.

Falar do Club **dentro do texto** continua permitido quando é assunto
("a gente fez isso na comunidade"), e citar PRO ou Elite pelo nome também.
O que sai é o **pedido**.

### 3. O CTA é do app e varia por sessão

Comportamento já implementado (F063 decisão 1, entregue na F067). Esta
feature o transforma em **regra da fronteira**, não em código novo:

| Sessão | Bloco de promessa | Formulário de cadastro |
|---|---|---|
| **Deslogada** | completo — "Isto é uma amostra do que a gente faz" + os dois CTAs (`Criar conta grátis` para a âncora, `Ver os planos`) | **sim** |
| **Logada free** | compacto — promessa + `Ver os planos` | não |
| **Logada paga** (inclui admin e instructor, por `isPaidMembership`) | **nada** | não |

O invariante que o corpo não pode quebrar: **pedido de cadastro só existe
para quem está deslogado, e só uma vez na página.**

### 4. O bloqueio é no servidor, em publicar **e** editar

Uma função pura em `src/lib/gifts/cta-no-corpo.ts` recebe o corpo e devolve
os achados da decisão 2. Ela é chamada em dois lugares, com pesos
diferentes:

| Onde | Papel |
|---|---|
| `createPost` e `updatePost` (`src/lib/posts/index.ts`) | **a verdade** — achou, lança `CtaNoCorpoError` e nada é gravado |
| `composer.tsx`, antes do submit (só com `showGiftSlug`: admin no space Presentes) | conveniência — a mesma função, para a admin ver o trecho apontado sem gastar um round-trip |

Três escolhas dentro dessa decisão:

1. **No `src/lib/`, não na action.** As Server Actions são finas por
   convenção do projeto; a regra é de domínio e vale para qualquer caminho
   que grave um Presente.
2. **Editar também passa pelo gate.** Sem isso o corpo entra limpo e ganha
   o CTA no primeiro `updatePost` — que é exatamente como uma regra "de
   publicação" morre.
3. **Vale para todo o space `presentes`, com ou sem slug.** O slug decide
   se a página é pública, não se o texto é um Presente; e um post sem slug
   pode ganhar um depois.

**Bloqueia, não avisa.** O rascunho desta spec propunha aviso, com o
argumento de que gate contornado morre. Está recusado: um aviso que a
pessoa pode ignorar é a mesma regra editorial de antes, só que com mais
código. O que não pode acontecer é o CTA errado chegar na página pública —
e só o bloqueio garante isso.

O custo assumido está em Riscos: falso positivo trava o publish, e a saída
é reescrever a frase em terceira pessoa.

### 5. O entregável do Dobro

O que o editorial entrega por Presente, e nada além:

- `title` — título do artigo
- `body` — markdown, terminando no assunto (decisões 1 e 2)
- `slug` — o que vira `/presentes/<slug>`
- opcionais: `linkUrl`, `imageUrl`, `videoUrl`

Promessa, oferta, preço, botão e formulário **não** são campos do
entregável. Se um dia o CTA precisar variar por Presente, isso vira campo
de sistema com spec própria — não texto solto no corpo.

### 6. Auditoria do que já está publicado

`npm run audit:presentes` — script read-only
(`scripts/audit-cta-presentes.mts`) que roda a mesma função sobre todos os
posts do space `presentes` e imprime slug, regra e trecho.

Existe porque o bloqueio só vale para gravações novas: sem a lista, ninguém
sabe quais Presentes no ar já carregam CTA no corpo. Ele não corrige nada —
a limpeza é editorial, post a post. Também é o jeito de descobrir, **antes**
do deploy, se algum Presente vivo vai travar na próxima edição.

#### O que a auditoria achou em produção (31/08/2026)

Rodada antes do merge, contra os 14 Presentes no ar: **um** achado.

```
/presentes/fluxo
  • [pedido-de-cadastro] "Abre [n8n.io](https://n8n.io) e cria sua conta."
```

Falso positivo quanto à intenção — o cadastro é **do n8n**, não do Club —
e exatamente o custo que a decisão 4 assume: a regra casa imperativo de 2ª
pessoa sem saber de que produto a frase fala. A saída prevista é reescrever,
e foi o que se fez: `e cria sua conta` → `e faz o cadastro`, que mantém a voz
imperativa do passo a passo e não casa nenhum dos `PEDIDOS`
(o padrão de cadastro é `faca\s+(?:o\s+)?seu\s+cadastro`).

Aplicado por `scripts/fix-cta-fluxo-f070.mts`, que confere o resultado com a
própria `detectarCtaNoCorpo` depois de gravar. Nova auditoria: **14
Presentes, nenhum com CTA no corpo.** Staging tem só um Presente e ele já
passava limpo.

## O que muda e o que não muda

**Muda** um caminho só: gravar um post no space `presentes` passa a recusar
corpo com CTA (decisão 4). É comportamento novo de **publicação**, visível
apenas para admin — a única pessoa que publica ali
(`ADMIN_ONLY_PUBLISH_SLUGS`).

**Não muda:**

- O que a leitora vê: as três variantes já estão no ar desde a F067
- A copy do `PresentePromessa` e do `GiftSignupForm`
- O funil, a atribuição por post (F059) ou o cadastro inline
- Qualquer gate de tier
- Publicar em qualquer outro space

## Fora de escopo

- CTA por Presente (campo no banco, variação por slug)
- Publicar o artigo fora da comunidade — o Presente continua em
  `/presentes/[slug]`
- Reescrever os Presentes já publicados como parte do código; a limpeza é
  editorial e entra nos critérios
- Analytics de clique no CTA
- Mudança de preço, de checkout ou de webhook

## Riscos

- **Artigo que termina seco.** Sem a ponte temática da decisão 1, o texto
  acaba e o bloco do app entra sem transição. A ponte não é opcional — é o
  que faz o CTA do Club parecer continuação, e não anúncio colado.
- **Falso positivo trava o publish.** É o custo assumido do bloqueio. O
  caso real é `pedido-de-cadastro` num tutorial sobre outra ferramenta
  ("cadastre-se no n8n"). A saída é reescrever em terceira pessoa — "o
  cadastro no n8n é gratuito" — e o erro diz qual trecho casou. As outras
  quatro regras são de host, preço exato e string exata: não têm como pegar
  prosa por engano.
- **Editar Presente antigo trava.** Um Presente publicado antes desta regra
  só volta a ser editável depois de limpar o corpo. É intencional — mas a
  auditoria da decisão 6 precisa rodar **antes** do deploy, para ninguém
  descobrir isso no meio de uma correção urgente.
- **A regra virar cerca burra.** Se um dia a lista da decisão 2 crescer a
  ponto de bloquear texto legítimo, o caminho é mudar a spec — não
  contornar com escape hatch no código.

## Critérios de aceitação

- [x] Spec antes do código
- [x] A detecção é função pura em `src/lib/gifts/cta-no-corpo.ts`, sem
      dependência de Next, com teste
- [x] Preço e promessa vêm de `checkout.ts` — sem string duplicada
- [x] `createPost` recusa Presente cujo corpo casa com a decisão 2
- [x] `updatePost` recusa a mesma coisa — publicar e editar têm o mesmo gate
- [x] A regra vale para todo o space `presentes`, com ou sem slug
- [x] Post fora de Presentes não passa pela regra
- [x] O erro nomeia a regra e mostra o trecho que casou
- [x] Composer roda a mesma função antes do submit e mostra os achados
- [x] `/planos` em outro host (ex.: `exemplo.com/planos`) não bloqueia
- [x] Preço do cliente no texto (ex.: `R$ 2.000`) não bloqueia
- [x] `npm run audit:presentes` lista os Presentes publicados com achados
- [x] Página do Presente continua com as três variantes da decisão 3
      (deslogada, free, paga) — sem mudança de comportamento
- [x] Auditoria rodada **antes** do merge — contra produção, que é onde os 14
      Presentes vivem (staging tem um, e já passava limpo)
- [x] Presentes já publicados limpos: 1 achado em `/presentes/fluxo`,
      reescrito; nova auditoria acusa 0 de 14
- [x] Sem migration nesta feature
- [ ] Preview / HML antes de produção
