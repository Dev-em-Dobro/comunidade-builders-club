# F091 — CTA de upgrade na descrição da aula (só Free)

## Status
Em implementação — 2026-09-18

Fonte operacional: Dobro OS → Crescimento (decidida em 14/09/2026).
Régua do texto: processo `bc-onboarding-aluno` §4.1 (o que cada plano entrega).
Depende de: [F065](F065-aulas-fase-1-free.md) (`freeAccess` / Comece por aqui),
[F053](F053-ofertas-pro-elite.md) (oferta PRO),
[F069](F069-faixa-upgrade-boas-vindas.md) (faixa em Boas-vindas — outra superfície).

## Contexto

Zero de 274 contas Free viraram pagantes. Em setembro a casa vendeu 3 planos
PRO, e nenhum veio do Free: entraram direto no pago, sem passar pelo presente
nem pela conta gratuita.

Não existe, hoje, um lugar **dentro da aula** onde quem está consumindo o
conteúdo gratuito descubra que há um próximo passo pago. A pessoa assiste,
marca como concluída e não é convidada para nada. 267 pessoas abriram a
primeira aula gratuita.

A faixa da [F069](F069-faixa-upgrade-boas-vindas.md) cobre só Boas-vindas. O
cadeado ([F067](F067-copy-do-ganho-free.md)) só aparece **depois** de ela
tentar uma aula paga. Esta feature é o único ponto do produto onde o Free já
está com a atenção no conteúdo que ele **pode** assistir.

## Decisões

### 1. Onde

Bloco na aba **Informações** da página da aula, **depois** da descrição (ou
no lugar dela, se a aula ainda não tem texto). Não entra no player, não
substitui o overlay de aula bloqueada, não vai para a aba Comentários.

### 2. Quem vê

Só quem **é Free e já pode assistir aquela aula**: `!isPaid && canWatch`.

- Pago, admin e instructor não veem (`isPaidMembership` já os trata como pagos).
- Free numa aula paga **não** vê este bloco: ela não assiste essa aula, e o
  overlay do player já convoca o PRO (`motivo=aulas`). CTA em aula paga é
  pitch para quem não está na tela.

A visibilidade segue `canWatchLesson`, não uma lista de slugs. Hoje isso é o
Comece por aqui (5 aulas). Se o admin marcar `freeAccess` nas portas das
trilhas, o bloco aparece lá sem código novo.

### 3. O que diz

O texto fala do **PRO (R$ 297)**, pela tabela §4.1:

1. **Postar na comunidade** — nos spaces além do Desafio Projetos
2. **Arsenal** — skills, templates e materiais
3. **Aulas pagas** — a formação depois do Comece por aqui

Não promete:

- live de terça / reunião semanal (Elite)
- garantia de 90 dias (Elite)
- "Feche o 1º cliente em 90 dias" (`PROMESSA_PRIMEIRO_CLIENTE`) — a frase
  mistura o prazo da garantia Elite com a meta de marketing

O texto visível é o da arte (`public/banners/upgrade-aula-*.webp`):

- **Título:** Tenha acesso ao arsenal completo do Builders Club
- **Itens:** sites prontos, propostas, modelos de contrato, recursos exclusivos
- **Preço:** 12× R$ 30,18 (pintado na arte; bate com `PRICING_PRO`)
- **CTA:** Ver planos e benefícios

Não promete live de terça nem garantia de 90 dias. Sem `PROMESSA_PRIMEIRO_CLIENTE`.

A escolha PRO vs Elite é o trabalho da `/planos`.

### 4. Para onde leva

`hrefPlanos({ motivo: "aula-descricao" })` — a página de compra que já existe.
Sem página de vendas nova, sem `destaque=elite`, sem checkout direto.

O motivo existe para continuidade da copy e para medir este bloco à parte do
cadeado (`aulas`) e da faixa de Boas-vindas (`boas-vindas`). Nunca abre modal.

Copy da `/planos` neste motivo: continuidade do banner (Arsenal + 12×).
Sem live, sem garantia de 90 dias.

### 5. Forma

Banner da design no lugar do card de texto. Desktop (`upgrade-aula-desktop.webp`,
2126×740) a partir de `md`; mobile (`upgrade-aula-mobile.webp`, 1162×1354)
abaixo. A peça inteira é o link. Cantos `rounded-2xl`. Sem X, sem cookie.

## Fora de escopo

- CTA em aula paga (o overlay já cobre)
- Página de vendas nova
- Prometer live de terça ou garantia de 90 dias
- Analytics de clique além do `motivo` na URL
- Alterar a faixa de Boas-vindas (F069)
- Alterar preço, checkout ou ofertas

## Como saber se deu certo

Métrica: Free → pago (linha do relatório diário do Telegram, a partir de
14/09/2026). Esperado: de 0 para pelo menos 1 até 30/09/2026. Prazo desta
ação: 19/09/2026. Veredito na semana seguinte, Dobro OS → Crescimento.

## Critérios

- [x] Spec antes do código
- [x] Free vê o bloco na aba Informações de aula que ele já pode assistir
- [x] Pago, admin e instructor não veem
- [x] Free em aula paga não vê este bloco (só o overlay)
- [x] Copy do banner (Arsenal + 12× R$ 30,18); sem live nem garantia de 90 dias
- [x] CTA leva a `/planos?motivo=aula-descricao`
- [x] `/planos` com esse motivo continua a frase, sem pitch de Elite
- [x] Layout empilha no mobile
- [ ] Preview / HML com conta Free antes de produção
