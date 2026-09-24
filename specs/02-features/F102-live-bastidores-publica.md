# F102 — Bastidores: a live pública de quinta assume o topo do Club

## Status

Implementada — 2026-09-24. Branch `feature/F102-live-bastidores-publica`
(base `main` `75a2220`). Falta validar em Preview/HML.

**A faixa é HTML, não imagem** (decisão 6). As duas artes provisórias em WebP
foram removidas do repositório junto com o `alt` que duplicava a copy.

Renumerada de F099 para F102 em 2026-09-24: `F099` já tinha sido usado por
`F099-aula-texto-precificacao-gpt-maker`, que entrou na `main` antes desta.

Muda comportamento de: [F079](F079-aviso-live-faixa-agenda-email.md) (faixa da
live semanal sai do topo) e [F082](F082-whatsapp-avisos-live.md) (FAB de
WhatsApp sai).
Divide o slot do topo com: [F088](F088-banner-imersao-free.md) (faixa da
Imersão, com prazo até 24/09 — já vencido).

## Contexto

O domínio só conhece uma live: terça 20h, benefício da oferta Elite, avisada
por faixa no topo e por e-mail (F079 — que já levou dois hotfixes só para
apertar quem vê: o Free saiu em 05/09 e o PRO em 07/09).

Nasce uma segunda live, com função oposta. **Bastidores dos 5 Dígitos com IA**,
toda quinta às 20h, aberta a qualquer pessoa. Não é entrega de plano: é topo de
funil. Aquecer o Free, subir consciência e vender o PRO — ou puxar a pessoa
para o evento pago (Imersão, Black) e vender lá. Tem pegada de exclusivo: quem
assiste não leva gravação; gravação é benefício de aluno pagante.

O problema comercial é o que a F091 já registrou: 274 contas Free, nenhuma
convertida. A faixa do topo é o espaço mais nobre do Club e hoje está ocupada
por um aviso que **só o Elite vê** — quem já comprou tudo.

## Decisões

### 1. Duas lives, dois nomes

| | **Live semanal** | **Bastidores** |
|---|---|---|
| Quando | Terça, 20h | Quinta, 20h |
| Quem entra | Elite | Qualquer pessoa |
| Natureza | Entrega da oferta Elite | Topo de funil |
| Gravação | Sim | **Não para quem assiste** — só aluno pagante recebe |
| Aviso no Club | E-mail (decisão 2) | Faixa no topo |

`specs/01-domain-model.md` hoje define **Live** como "encontro semanal (regra
padrão: terça 20h)" — passa a distinguir as duas. No código e na copy o termo é
**Bastidores**, não "live pública", "live aberta" nem "live de quinta".

### 2. A faixa da live de terça sai — o e-mail fica

Sai o `<LiveBanner>` de `src/components/app-shell-client.tsx:551-553`.

Não muda: lembrete por e-mail na véspera e pouco antes (`src/lib/live/lembrete.ts`,
cron), `isElegivelLembreteLive`, e a regra de horário no Admin.

Dois efeitos colaterais, aceitos:

- O Elite perde o botão **"Marcar na agenda"**, que só existia na faixa.
  `googleCalendarUrl` fica sem consumidor; o módulo e o teste continuam no
  repositório, porque a agenda deve voltar em outra superfície.
- `/api/nav` deixa de devolver `live`. Sem a faixa, aquele payload só
  entregaria o `zoomUrl` (que viaja dentro do `calendarUrl`) ao browser do
  Elite sem ninguém consumir.

### 3. O FAB de WhatsApp sai junto

Sai o botão verde flutuante do canto inferior direito (F082). Dois convites de
WhatsApp na mesma tela competem entre si, e apontam para grupos de públicos
diferentes: o da F082 era aviso da live de aluno, o desta é aberto.

Saem também: `src/components/whatsapp-live-fab.tsx`,
`src/lib/live/whatsapp-grupo.ts` (+ teste + reexport em `src/lib/live/index.ts`),
a prop `whatsappAvisosLiveUrl` no shell e a env
`NEXT_PUBLIC_WHATSAPP_AVISOS_LIVE_URL` em `.env.example` e
`docs/deploy-vercel.md`.

Não há nada para desligar em produção: a env nunca foi definida lá
(`docs/deploy-vercel.md` mandava não definir até existir link oficial), ou seja,
o FAB só existiu em HML. A F082 fica marcada como revogada por esta.

### 4. Quem vê: todo mundo logado

Free, PRO, Elite, admin e instructor. Sem gate de tier nem de status.

A live é aberta, e aluno pagante é justamente quem convida gente de fora. O
Elite não perde aviso: a live dele continua chegando por e-mail.

Não dispensável, como a F079 e a F088 — é faixa de campanha, não notificação.

### 5. Precedência no slot do topo

O slot já era disputado por duas faixas mutuamente exclusivas por tier: a
Imersão (F088) e a live semanal (F079). Com a F079 fora (decisão 2), sobra a
Imersão, que expira sozinha (`IMERSAO_IA.terminaEm`).

Ordem: **Imersão ganha enquanto `imersaoAtiva()`**; Bastidores aparece para o
resto e assume o slot inteiro depois do prazo. Uma faixa por vez — nunca as
duas empilhadas.

**O gate da Imersão é `isElite`, não `isPaid`.** A F088 corrigiu isso em 24/09,
depois que esta spec foi escrita: a Imersão é onde o Elite é vendido, então
esconder a faixa de quem é PRO tirava dela justamente o público que ainda tem o
que comprar. Quem não vê a Imersão é só o Elite — e staff, que
`isEliteMembership` também devolve como Elite. `faixaDoTopo` recebe `isElite` e
espelha essa regra; quem cai fora dela vê Bastidores, que é aberta e não tem
gate de tier nenhum.

### 6. A faixa é HTML, não imagem

A primeira entrega usou duas artes em WebP e não sobreviveu. O motivo é
geométrico: o shell tira **260px de sidebar a partir de 768px**
(`app-shell-client.tsx:457`), então a faixa **encolhe de 767px para 508px
exatamente quando a tela cresce**. A caixa que a arte precisa preencher varia
de 2,1:1 (celular) a 11:1 (monitor largo), e nenhuma peça de proporção fixa
cobre isso:

- servindo a arte inteira (`h-auto`), o tipo renderizava a **7–9px**;
- cortando com altura fixa + `object-cover`, sumia **60% da peça** no tablet.

A versão anterior desta decisão especificava três peças de arte, com canvas,
tipografia mínima e zona de segurança para cada uma. **Está descartada.** Era
um remendo caro para um problema que o HTML não tem.

#### 6.1 Container query, não `md:`

O ponto que derrubou a primeira tentativa em HTML também: `md:` mede o
**viewport**, e 768px é justamente onde a sidebar entra. O layout largo ligaria
no mesmo pixel em que a caixa cai para 508px.

A faixa usa `@container` e reage à **própria largura**. O corte é `@lg`
(512px), escolhido para deixar a faixa de 508px — o aperto do tablet — do lado
estreito. Efeito colateral desejável: a faixa fica correta em qualquer
superfície onde for reusada, com ou sem sidebar, sem saber nada sobre o shell.

#### 6.2 Dois arranjos

| | **Estreito** (< 512px) | **Largo** (≥ 512px) |
|---|---|---|
| Direção | Empilhado | Duas colunas |
| Badge | À direita do título, na mesma linha | Acima do título |
| Parágrafo | Não aparece | Sob o título |
| Calendário | Glifo solto de 12px | Ladrilho verde de 32px |
| CTA | Barra de largura cheia | Botão de largura automática |

O badge **não é duplicado no DOM**: no estreito a `justify-between` o empurra
para a direita; no largo um `flex-col-reverse` inverte a dupla e ele sobe.

#### 6.3 Teto de altura: 150px

A faixa divide o topo com o conteúdo do feed e não pode virar outdoor.
`max-h-[150px]`, com `overflow-hidden` como rede.

Alturas reais medidas: **120px** em 390px de faixa, **128px** em 764px,
**135px** em 1180px.

O teto é apertado e **toda a escala tipográfica está calibrada contra ele**:

| Elemento | Estreito | Largo |
|---|---|---|
| Título | 16–17px | 20px (23px em ≥ 896px) |
| Badge | 8px | 8px |
| Parágrafo | — | 11,5px |
| Data | 11px | 12px |
| CTA | 11px | 12px |

**Subir qualquer um desses valores sem remedir estoura a caixa**, e o
`overflow-hidden` corta o CTA em silêncio. Foi o que aconteceu duas vezes
durante a implementação.

#### 6.4 O que o HTML resolveu de graça

- **Acessibilidade**: o texto é DOM. Sem `alt` espelhando copy, sem risco de
  os dois saírem de sincronia.
- **Peso**: −220KB de WebP.
- **Manutenção**: trocar a copy da campanha é editar `bastidores.ts`. Não passa
  por editor de imagem nem por novo deploy de asset.
- **Nitidez**: sem reamostragem em nenhuma densidade de tela.

#### 6.5 O que ele custou

- **Os dois rostos saíram.** Eram foto, e foto não vira CSS. A faixa é tipo,
  cor e um motivo geométrico em SVG.
- **A faixa é escura nos dois temas**, como as artes eram. Consciente, mesma
  natureza da nota que a F086 deixou sobre o painel do login. Por isso as cores
  do componente são literais e não token: `bg-accent` viraria verde-claro no
  tema claro e mataria o contraste do texto branco.
- **O parágrafo some abaixo de 512px.** Ali ele competiria com o CTA pelo mesmo
  espaço vertical, e o CTA é o que precisa sobreviver.

### 7. Para onde leva

`https://sndflw.com/i/JaDGKmxpDHdXT85jCpAg` — redirecionador (Sendflow) que
distribui entre grupos de WhatsApp. Nova aba, `rel="noopener noreferrer"`.

URL e copy vivem em `src/lib/eventos/bastidores.ts`, espelhando
`src/lib/eventos/imersao-ia.ts`: é link de marketing, não é segredo e não muda
por ambiente, então **não vira env** (diferente da F082, que era env porque o
link oficial ainda não existia).

Sem UTM: o destino é um redirecionador de WhatsApp e não repassa query string.

### 8. Como saber se deu certo

Clique na faixa (Clarity, F074), tamanho do grupo antes/depois e presença na
quinta. Sem instrumentação nova nesta entrega.

## Fora de escopo

- **A gravação** — onde fica, quem libera, como o pagante acessa. Precisa de
  spec própria: hoje aula é Panda dentro de módulo, e "gravação de live" não é
  aula de trilha.
- **Superfícies deslogadas** — a live é aberta a todo mundo, mas a faixa só
  alcança quem está logado no Club. Landing, páginas de Presente (F059/F071) e
  a tela de login ficam para outra entrega. É o maior furo deste desenho, e é
  proposital: aqui só se resolve o público que já está dentro.
- **E-mail de Bastidores** — a régua (F075/F084/F089) não ganha disparo novo.
- **Zoom** — sala, inscrição e controle de entrada seguem fora do Club.
- **Devolver o "Marcar na agenda" ao Elite** em outro lugar do produto.

## Critérios de aceitação

1. Logado em **qualquer** tier (Free, PRO, Elite, admin, instructor) vê a faixa
   de Bastidores no topo do Club.
2. Clicar na faixa abre `https://sndflw.com/i/JaDGKmxpDHdXT85jCpAg` em nova aba.
3. A faixa da live de terça não aparece para ninguém, em nenhum tier.
4. O lembrete por e-mail da live de terça continua saindo para Elite `member`
   ativo, na véspera e pouco antes — sem alteração de regra nem de dedupe.
5. O FAB verde de WhatsApp não aparece mais, com ou sem env definida.
6. `/api/nav` não devolve mais `live`, e nenhum `zoomUrl` trafega para o client.
7. Enquanto a Imersão estiver no prazo, **todo mundo menos Elite** vê a faixa
   dela — Free, `paid` legado e PRO (gate `isElite`, F088). Elite e staff veem
   a de Bastidores. Depois do prazo, todo mundo vê a de Bastidores. Nunca as
   duas juntas.
8. **A faixa nunca passa de 150px de altura**, em nenhuma largura de 320px a
   2560px, e nada do conteúdo é cortado pelo `overflow-hidden`. Medido em
   320/390/508/764/1180/1660px de faixa.
9. **Título, dia, hora e CTA são texto no DOM** — não imagem, não `alt`,
   não `background-image`. Um leitor de tela lê a faixa sem depender de
   atributo espelhado.
10. O arranjo troca pela **largura da faixa**, não pela do viewport: em
    viewport de 768px (faixa de 508px, sidebar presente) vale o layout
    estreito, não o largo.
11. `public/banners/bastidores-*.webp` não existem mais, e nada importa
    `BASTIDORES_BANNER` nem `BASTIDORES.alt`.
12. `npm run build` e `npm test` passam; sem import órfão de
    `whatsapp-grupo`/`LiveBanner`.

## Pendências (dependem do Ricardo)

- **Confirmar que o link do Sendflow** é o destino do público Free (e não um
  grupo só de aluno).
- **A live de terça fica sem aviso nenhum dentro do produto.** Confirmado que o
  e-mail basta por ora.
- **Os dois rostos não existem mais na faixa** (decisão 6.5). Se a peça precisar
  deles de volta, é um PNG recortado com fundo transparente, posicionado à
  direita e só em `@lg+` — não volta a ser a faixa inteira em imagem.
- **Superfícies deslogadas continuam sem a faixa** (ver Fora de escopo). Agora
  que ela é um componente que se adapta sozinho à largura do container, o custo
  de colocá-la em Presente/login caiu bastante.
