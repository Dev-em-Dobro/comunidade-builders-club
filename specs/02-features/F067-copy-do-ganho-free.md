# F067 — Copy do ganho: o free lê o que leva, não o que falta

## Status
Em implementação — 2026-08-28

## Contexto

Teste percorrido como free real em 28/08/2026, com o código de `main`
(F063 + F065 + F066), conta criada do zero pelo `/cadastro`.

Os **gates** estão certos: free lê o feed e os spaces abertos, assiste o
M01, publica no Desafio Projetos, esbarra em cadeado no resto. O que está
errado é o **texto** em volta deles. Em quase toda superfície o produto
descreve a tranca em vez do ganho, e em duas ele descreve errado o próprio
plano gratuito.

Achados que esta feature resolve:

1. **O feed subestima o free.** `page.tsx` diz "Comentar, reagir e os
   spaces da comunidade são do PRO e do Elite". Depois da F063 o free lê
   Avisos, Presentes, Geral, Dúvidas, Conquistas e Desafio Projetos — e
   pela F065 publica e comenta em Projetos. É a primeira frase que ela lê
   no feed e vende menos do que o produto entrega.
2. **"Três passos" acima de quatro.** A descrição do space Boas-vindas no
   banco diz "Tutorial e os três passos do primeiro dia"; a trilha free
   tem quatro passos. O fallback do código já trata os dois casos, mas a
   descrição do banco vence.
3. **Conquistas convida a uma ação bloqueada.** A descrição manda postar;
   o free não publica lá.
4. **Modais e paywall falam de tranca.** "Reagir é para membros",
   "Comentar é para membros", "Space exclusivo para membros", "Esta aula é
   do plano pago". Ela **é** membro — free é um tier, não a ausência de
   um. Nenhum diz o que ela ganha ao subir.
5. **Login e cadastro não dizem o que o Club faz.** As palavras cliente,
   90 dias, IA e automação não aparecem em nenhuma das duas telas.
6. **O e-mail do código não vende nada** e ainda manda olhar o spam de
   dentro do próprio e-mail que a pessoa está lendo.

O bloco de promessa na página do presente é o degrau que falta no mesmo
funil, mas já está especificado na
[F063](F063-funil-presente-conta-free.md#1-bloco-da-promessa-na-página-do-presente).
Esta feature **não** reescreve aquela decisão — implementa e marca os
critérios de lá.

## Princípio

Toda tela que encontra o free responde, nesta ordem:

1. o que ele **tem agora** no gratuito;
2. o que ele **leva** ao subir;
3. só então o preço.

Nunca começa pela negativa. A palavra "membro" não é usada para separar
free de pago — free é membro. O separador é o nome do plano: **PRO** e
**Elite**.

## Decisões por superfície

### 1. Feed do free — `src/app/(app)/page.tsx`

Sai a lista do que é bloqueado. Entra o que o feed é, no vocabulário do
avatar (IA, automação, freela) e com a razão de ler.

> Aqui a comunidade posta o que está dando resultado: IA, automações e
> freela — cliente fechado, preço praticado e o que travou no caminho. No
> gratuito você lê tudo, assiste as primeiras aulas e posta o seu no
> Desafio Projetos. **Ver planos**

O link para `/planos` continua, no fim da frase.

**"Leitura liberada" não serve** — foi a primeira versão desta frase e
subestima o plano de novo, pelo outro lado. Pela F065 o free **assiste** o
Comece por aqui e **publica** no Desafio Projetos. A frase tem que listar
as três coisas que ele faz: ler, assistir e postar.

### 2. Boas-vindas — descrição do space

"três passos" → **passo a passo**, que serve para as duas trilhas (3 do
pago, 4 do free) e não precisa mudar de novo quando a trilha mudar.

Muda no banco (`prisma/seed.ts` e os dois scripts de seed que repetem a
string) **e** no fallback do `welcome-space-view.tsx`, que hoje tem uma
frase por tier.

Deploy: `npm run db:seed` já faz `update` da `description` no upsert —
rodar o seed em HML e prod aplica a correção.

### 3. Conquistas — descrição do space

Frase que serve para quem lê e para quem posta:

> Cliente fechado, proposta aceita, primeiro pagamento — e como foi o
> processo pra fechar. Leia o que já deu certo e, quando for a sua vez,
> poste a sua.

Desafio Projetos fica como está: o free publica lá (F065), o convite é
verdadeiro.

### 4. Modais de upgrade — `UPGRADE_REASON_COPY`

Reescritos pelo ganho, um por motivo. Sai "é para membros" de todos os
títulos. O motivo `geral` passa a abrir com a promessa da F053
(`PROMESSA_PRIMEIRO_CLIENTE`).

### 5. Paywall da aula — `aulas/[moduleSlug]/[lessonSlug]/page.tsx`

"Esta aula é do plano pago" → **Continue a formação**, com o corpo
dizendo o que vem depois do Comece por aqui (nicho, prospecção,
abordagem, fechamento). CTA `/planos?motivo=aulas` inalterado.

### 6. Login — `src/components/login-form.tsx`

Subtítulo passa a dizer o que o Club é. Abaixo do "Criar conta grátis",
uma linha do que a conta gratuita já dá.

### 7. Cadastro — `src/app/cadastro/page.tsx`

Mesma lógica: o subtítulo diz o ganho antes do mecanismo (código de 6
dígitos). Headline da F066 preservada.

### 8. E-mail do código — `src/lib/email/index.ts`

- **Sai** "Se não achar este e-mail, olhe em spam e em promoções" (texto e
  HTML). A pessoa está lendo o e-mail; a instrução é para a tela do app,
  onde ela continua existindo.
- **Entra** uma linha do que espera do outro lado do código. Vale para
  free e para quem já é pago (o pago tem isso e mais).
- Assunto e validade de 10 minutos ficam como estão.

## Fora de escopo

- Preço, checkout, webhook, regra de tier ou de allowlist
- Novos gates ou mudança nos existentes
- Faixa de upgrade na tela de Boas-vindas (segue pendente na F063)
- Regravar o vídeo de boas-vindas do free (pendente na F063)
- Traduzir a mesma copy para o e-mail de magic link

## Critérios

- [x] Spec antes do código
- [x] Feed do free não lista bloqueio; descreve o feed e mantém "Ver planos"
- [x] Nenhuma tela do free diz "três passos" com quatro passos na lista
- [x] Descrição de Conquistas serve para quem lê e para quem posta
- [x] Nenhum título de modal de upgrade usa "para membros"
- [x] Cada modal diz o que a pessoa ganha ao subir
- [x] Paywall da aula abre pelo que vem depois, não pela tranca
- [x] Login e cadastro dizem o que o Club faz e o que o gratuito já dá
- [x] E-mail do código não fala em spam e diz o que espera do outro lado
- [x] Bloco de promessa no presente (implementa a decisão 1 da F063)
- [x] Validado em local com conta free real (28/08/2026): anônima, free e
      pago percorridos
- [ ] Preview / HML antes de produção
