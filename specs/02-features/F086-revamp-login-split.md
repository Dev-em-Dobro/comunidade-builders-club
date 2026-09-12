# F086 — Revamp visual do login e do cadastro (tela dividida)

## Status
Em desenvolvimento

## Problema
`/login` e `/cadastro` são um card solto no meio de uma página vazia. Em telas
grandes sobra fundo e falta presença de marca: a primeira tela do produto não
comunica nada além do campo de e-mail. As duas telas também divergem entre si
(`/login` abre com o nome do produto em 5xl, `/cadastro` com `page-title`).

## Referência
[SignInPage do 21st.dev](https://21st.dev/@bhomikproductivitylab/components/sign-in-page):
split 50/50 no desktop — painel visual sangrando na metade esquerda, formulário
centrado numa coluna estreita (~330px) na metade direita. Sem card, sem borda,
sem sombra: o formulário respira direto sobre o fundo.

## Decisões

### 1. Shell compartilhado `AuthSplitLayout`
Componente único (`src/components/auth-split-layout.tsx`) usado por `/login` e
`/cadastro`. Recebe o formulário como `children`.

```
DESKTOP (lg+, 1024px)          MOBILE (< lg)
┌───────────┬───────────┐      ┌───────────────┐
│  painel   │ formulário│      │    painel     │  ← faixa curta
│  de marca │  centrado │      ├───────────────┤
│  (50%)    │   (50%)   │      │  formulário   │
└───────────┴───────────┘      └───────────────┘
```

- Desktop: `grid-cols-2`, painel sangrando de topo a base.
- Mobile: painel vira faixa retangular no topo (~150px), formulário abaixo.
  É a orientação do dono do produto: no celular a imagem não pode comer a
  dobra antes do campo de e-mail.

### 2. O painel é de marca, não foto
Não existe asset vertical no repositório, e a capa 16:9 do boas-vindas tem
texto queimado que o recorte vertical decapita. O painel é desenhado em
CSS + SVG: sem arquivo, sem peso, nítido em qualquer densidade de tela.

A direção escolhida é **estrutura isométrica**: três blocos empilhados, do
mais largo ao mais estreito, assentados numa grade isométrica. É a operação
que a pessoa monta camada por camada — a metáfora que dá nome ao Club.

- O painel é **escuro nos dois temas** (claro e escuro). É o contraste que a
  referência tira da foto. O que segue o tema é a coluna do formulário.
- A **grade isométrica** é CSS (`repeating-linear-gradient` a ±30°), não SVG:
  ladrilha em qualquer proporção, então a mesma textura serve a coluna de
  720×900 do desktop e a faixa de 375×155 do mobile. Um `viewBox` fixo daria
  zoom absurdo na faixa.
- A **pilha de blocos** é SVG e só aparece a partir de `lg`, no vão entre o
  wordmark e o texto. Na faixa mobile ela teria tamanho de ícone; lá a grade
  sozinha carrega a textura.
- A pilha fica **no fluxo** (`flex-1`), não posicionada por cima. Com
  `absolute` + largura em `rem` ela encostava no wordmark e na frase em telas
  largas, onde o painel cresce mas o SVG não. No fluxo, o `py` vira folga
  garantida e o `preserveAspectRatio` encolhe a arte para caber no que sobrar.
- Conteúdo: wordmark `BUILDERS CLUB` + a frase de posicionamento do F067.
- Três provas de valor no rodapé do painel, **só no desktop** (`hidden lg:…`).
  Na faixa mobile não cabe sem empurrar o formulário para baixo da dobra.

### 3. O formulário perde o card
Sai o `rounded-2xl border bg-card shadow` que envolvia os campos. O formulário
fica direto sobre o fundo, numa coluna `max-w-sm` centrada verticalmente, como
na referência.

Hierarquia da coluna do formulário:
1. `h1` — `Entre na comunidade` (login) / `Crie sua conta grátis` (cadastro)
2. Linha de troca de tela: `Não tem conta? Criar conta grátis`
3. Botão do Google
4. Divisor `ou`
5. E-mail + botão de envio
6. Termos e privacidade
7. A linha do F067 sobre o que o gratuito entrega

### 4. Entrada animada
A tela se monta em ~1,4s. A ordem conta a mesma história do desenho: primeiro
a marca, depois a operação sendo empilhada, depois a promessa.

| Elemento | Atraso | Duração | Movimento |
| --- | --- | --- | --- |
| Wordmark | 0 | 420 ms | sobe 14px + fade |
| Risco sob o wordmark | 180 ms | 360 ms | desenha da esquerda para a direita |
| Bloco da base | 160 ms | 720 ms | cai de cima e assenta com repique curto |
| Bloco do meio | 400 ms | 720 ms | idem |
| Bloco do topo | 640 ms | 720 ms | idem |
| Frase de posicionamento | 140 ms | 420 ms | sobe 14px + fade |
| Provas de valor | 420/510/600 ms | 420 ms | sobe 14px + fade, em cascata |
| Coluna do formulário | 0 | 420 ms | sobe 14px + fade |

- Os blocos empilham **de baixo para cima**: é a ordem de quem constrói.
- Os blocos são o movimento mais lento da tela de propósito — é o que a
  pessoa deve acompanhar. Na primeira versão (440 ms, 120/250/380) eles se
  sobrepunham e a pilha parecia aparecer de uma vez em vez de ser montada.
- Com a duração maior, o repique forte virava borracha: a curva passa menos
  de 1 do que a primeira versão (`1.15` no lugar de `1.3`).
- A queda é medida em unidades do `viewBox`, não em px de tela, para escalar
  junto com a arte quando o painel encolhe.
- O último bloco assenta em 1,36s e fecha a entrada — a pilha completa é o
  final da cena, depois das provas de valor.
- A coluna do formulário **não espera** o painel. É a parte funcional da tela;
  atrasar o campo de e-mail para exibir enfeite é custo, não polimento.
- `prefers-reduced-motion: reduce` zera todas as animações. Como nenhum
  elemento depende do `fill: both` para ficar visível, a tela aparece pronta.

### 5. Sem jargão no botão
O botão do login dizia `Receber magic link`. "Magic link" é vocabulário de
quem constrói autenticação, não de quem está tentando entrar: o rótulo não
diz o que acontece ao clicar. Passa a ser **`Receber link de acesso`**.

Os documentos legais (`/termos`, `/privacidade`) mantêm o termo técnico —
ali ele descreve o mecanismo para efeito de contrato, e mexer em texto legal
é decisão separada.

### 6. O que não muda
- Toda a lógica de autenticação de `login-form.tsx` e `gift-signup-form.tsx`
  fica intacta: magic link, Google, erros de callback, estado `sent`,
  `conta=excluida`, `data-clarity-mask`.
- A frase de posicionamento e a linha do gratuito (F067) continuam na tela nos
  dois tamanhos — a frase migra para o painel, a linha do gratuito fica na
  coluna do formulário.
- O `ThemeToggle` continua no canto superior direito, mas ancorado na **coluna
  do formulário**, nunca sobre o painel escuro (onde `btn-ghost` fica ilegível).

### 7. Fora de escopo
`/cadastro/[utmContent]` (landing de atribuição de presente) segue com o layout
atual. Ela tem copy e estados próprios (visitante já logado, aviso de conta
criada) e entra numa feature separada se for o caso.

## Critérios
- [ ] `AuthSplitLayout` existe e é usado por `/login` e `/cadastro`
- [ ] Desktop (≥1024px): duas colunas de 50%, painel sangrando de topo a base
- [ ] Mobile: painel é faixa no topo de ~150px, formulário logo abaixo
- [ ] Painel é escuro nos dois temas; coluna do formulário segue o tema
- [ ] Painel mostra wordmark + frase de posicionamento nos dois tamanhos
- [ ] Grade isométrica visível nos dois tamanhos, sem deformar na faixa mobile
- [ ] Pilha de blocos aparece só a partir de `lg`, sem encostar no wordmark
      nem na frase de posicionamento (conferir em 1024px e em 1440px)
- [ ] As três provas de valor aparecem só a partir de `lg`
- [ ] Sem rolagem vertical no painel em 1920, 1440, 1280 e 1024 de largura
- [ ] Blocos empilham de baixo para cima, cada um visivelmente separado do
      anterior, e a tela toda se monta em ~1,4s
- [ ] Com `prefers-reduced-motion: reduce` nada some: tudo em `opacity: 1`
- [ ] Botão do login diz `Receber link de acesso`, sem "magic link"
- [ ] Formulário sem card: sem borda, sem sombra, coluna `max-w-sm` centrada
- [ ] `ThemeToggle` fica na coluna do formulário, não sobre o painel
- [ ] Link por e-mail, Google, estado `sent` e mensagens de erro seguem
      funcionando
- [ ] Linha do F067 sobre o gratuito continua visível nos dois tamanhos
- [ ] `data-clarity-mask` preservado nos campos
- [ ] Sem rolagem horizontal em 375px
