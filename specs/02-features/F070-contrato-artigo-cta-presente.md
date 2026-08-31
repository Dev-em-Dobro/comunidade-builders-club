# F070 — Contrato do Presente: o Dobro escreve o artigo, o Club escreve o CTA

## Status
Rascunho — 2026-08-31

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

Lista fechada, para o texto não precisar de julgamento a cada Presente:

- pedido de cadastro ou login — "crie sua conta", "cadastre-se",
  "entre no Club"
- link para `/cadastro`, `/login`, `/planos` ou para checkout
  (Hubla, `pay.tmb.com.br`)
- preço, parcelas ou nome de plano (PRO, Elite)
- a promessa do produto escrita à mão — ela é
  `PROMESSA_PRIMEIRO_CLIENTE`, de `src/lib/membership/checkout.ts`

Falar do Club **dentro do texto** continua permitido quando é assunto
("a gente fez isso na comunidade") — o que sai é o **pedido**.

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

### 4. Aviso no composer, não bloqueio

Único código desta feature. Uma função pura em `src/lib/gifts/` que recebe
o corpo e devolve os trechos suspeitos (os padrões da decisão 2). O
composer a usa **só** quando `showGiftSlug` é verdadeiro — o admin
publicando no space Presentes, que já é a condição de `composer.tsx:47` —
e mostra um aviso acima do botão de publicar.

Avisa, não impede. Duas razões:

1. **Falso positivo é real.** Um Presente sobre vender serviço pode citar
   "crie sua conta" descrevendo o fluxo de outra ferramenta. Bloquear
   obrigaria a contornar o gate, e gate contornado morre.
2. **A autoria é de um time pequeno e identificado.** O custo de um aviso
   ignorado é baixo; o de um publish travado em cima da hora, não.

Alternativa considerada e recusada: **só editorial**, sem código. Uma regra
que vive apenas numa spec não sobrevive ao terceiro Presente escrito com
pressa — e o erro só aparece depois, na página pública, para a leitora.

### 5. O entregável do Dobro

O que o editorial entrega por Presente, e nada além:

- `title` — título do artigo
- `body` — markdown, terminando no assunto (decisões 1 e 2)
- `slug` — o que vira `/presentes/<slug>`
- opcionais: `linkUrl`, `imageUrl`, `videoUrl`

Promessa, oferta, preço, botão e formulário **não** são campos do
entregável. Se um dia o CTA precisar variar por Presente, isso vira campo
de sistema com spec própria — não texto solto no corpo.

## O que esta feature não muda

- O comportamento da página: as três variantes já estão no ar desde a F067
- A copy do `PresentePromessa` e do `GiftSignupForm`
- O funil, a atribuição por post (F059) ou o cadastro inline
- Qualquer gate de tier

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
- **Aviso virar ruído.** Se a detecção pegar demais, o admin aprende a
  ignorar. A lista da decisão 2 é fechada de propósito.
- **Presentes antigos.** A regra vale a partir de agora; os já publicados
  precisam de uma passada manual, ou a página segue com dois fechamentos
  para quem já tem conta.

## Critérios de aceitação

- [ ] Spec antes do código
- [ ] Corpo de Presente novo termina no assunto, sem pedido de cadastro,
      link de plano/checkout, preço ou promessa escrita à mão
- [ ] Composer avisa o admin quando o corpo de um Presente casa com um dos
      padrões da decisão 2
- [ ] O aviso não impede publicar
- [ ] O aviso não aparece fora do space Presentes nem para não-admin
- [ ] A detecção é função pura em `src/lib/gifts/`, com teste
- [ ] Página do Presente continua com as três variantes da decisão 3
      (deslogada, free, paga) — sem mudança de comportamento
- [ ] Leitora logada não vê nenhum pedido de cadastro na página
- [ ] Leitora paga não vê oferta nenhuma
- [ ] Presentes já publicados auditados: CTA removido do corpo
- [ ] Preview only (sem migration nesta feature)
