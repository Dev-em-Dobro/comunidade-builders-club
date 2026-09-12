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
texto queimado que o recorte vertical decapita. O painel é construído em CSS:
gradiente teal da marca + brilhos radiais + malha sutil.

- O painel é **escuro nos dois temas** (claro e escuro). É o contraste que a
  referência tira da foto. O que segue o tema é a coluna do formulário.
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

### 4. O que não muda
- Toda a lógica de autenticação de `login-form.tsx` e `gift-signup-form.tsx`
  fica intacta: magic link, Google, erros de callback, estado `sent`,
  `conta=excluida`, `data-clarity-mask`.
- A frase de posicionamento e a linha do gratuito (F067) continuam na tela nos
  dois tamanhos — a frase migra para o painel, a linha do gratuito fica na
  coluna do formulário.
- O `ThemeToggle` continua no canto superior direito, mas ancorado na **coluna
  do formulário**, nunca sobre o painel escuro (onde `btn-ghost` fica ilegível).

### 5. Fora de escopo
`/cadastro/[utmContent]` (landing de atribuição de presente) segue com o layout
atual. Ela tem copy e estados próprios (visitante já logado, aviso de conta
criada) e entra numa feature separada se for o caso.

## Critérios
- [ ] `AuthSplitLayout` existe e é usado por `/login` e `/cadastro`
- [ ] Desktop (≥1024px): duas colunas de 50%, painel sangrando de topo a base
- [ ] Mobile: painel é faixa no topo de ~150px, formulário logo abaixo
- [ ] Painel é escuro nos dois temas; coluna do formulário segue o tema
- [ ] Painel mostra wordmark + frase de posicionamento nos dois tamanhos
- [ ] As três provas de valor aparecem só a partir de `lg`
- [ ] Formulário sem card: sem borda, sem sombra, coluna `max-w-sm` centrada
- [ ] `ThemeToggle` fica na coluna do formulário, não sobre o painel
- [ ] Magic link, Google, estado `sent` e mensagens de erro seguem funcionando
- [ ] Linha do F067 sobre o gratuito continua visível nos dois tamanhos
- [ ] `data-clarity-mask` preservado nos campos
- [ ] Sem rolagem horizontal em 375px
