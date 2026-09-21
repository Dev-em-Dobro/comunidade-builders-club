# F099 — Bastidores: a live pública de quinta assume o topo do Club

## Status
Implementada no código — 2026-09-21. Branch
`feature/F099-live-bastidores-publica` (base `main` `31c39cd`). Falta validar em
Preview/HML.

**Subiu com as artes provisórias cortadas** (decisão 6.5.4): as três peças
definitivas de 6.2/6.3 ainda não existem. Com o crop, o critério 8 (CTA a ≥14px
em 390px) **não é cumprido** — o que o garante hoje é a faixa inteira ser o
link, não o botão desenhado.

Muda comportamento de: [F079](F079-aviso-live-faixa-agenda-email.md) (faixa da
live semanal sai do topo) e [F082](F082-whatsapp-avisos-live.md) (FAB de
WhatsApp sai).
Divide o slot do topo com: [F088](F088-banner-imersao-free.md) (faixa da
Imersão, com prazo até 24/09).
Reaproveita o padrão de arte da [F091](F091-cta-upgrade-descricao-aula.md).

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

O slot já é disputado: `app-shell-client.tsx:549-553` tem "F088 imersão só Free;
F079 live só Elite, mutuamente exclusivos por tier". Com a F079 fora, sobra a
Imersão, que expira sozinha em 24/09 (`IMERSAO_IA.terminaEm`).

Ordem: **Imersão ganha enquanto `imersaoAtiva()`**; Bastidores aparece para todo
o resto e assume o slot inteiro depois do dia 24. Uma faixa por vez — nunca as
duas empilhadas.

### 6. A arte, e por que a peça mobile precisa mudar

Padrão da F091: PNG vira WebP q90 em `public/banners/`, servido por
`<Image unoptimized>` — mas aqui em **três** versões, não duas (ver 6.1).

A conta que decide o corte:

```
fonte renderizada = (fonte na arte ÷ largura da arte) × largura da faixa
```

A faixa nunca tem a largura da tela — o shell tira 260px de sidebar em `md+`
(`app-shell-client.tsx:464`).

| Peça | Arquivo | Elemento | Proporção da largura | Faixa real | Renderiza |
|---|---|---|---|---|---|
| Wide | 3840×600 (1920×300 @2x) | título | ~2,1% | 1660px (tela de 1920) | ~35px ✅ |
| Wide | | parágrafo | ~0,55% | 1660px | **~9px** ❌ |
| Mobile | 1600×680 (800×340 @2x) | título | ~5,9% | 390px (celular) | ~23px ✅ |
| Mobile | | parágrafo | ~1,9% | 390px | **~7px** ❌ |
| Mobile | | botão "Entrar no grupo" | ~2,0% | 390px | **~8px** ❌ |

(Medido nas artes; ±1px.)

Os títulos aguentam as duas. O parágrafo não aguenta nenhuma, e no celular o
**CTA** — a única coisa que precisa ser clicada — sai a 8px.

### 6.1 São **três** peças, não duas

A sidebar tem 260px fixos a partir de 768px (`app-shell-client.tsx:464`). Ou
seja, a faixa **encolhe** de 767px para 508px justamente quando a tela cresce.
Isso cria três regimes, e nenhuma arte cobre os três:

| Peça | Viewport | Largura real da faixa |
|---|---|---|
| Mobile | < 640px | 320–639px (sem sidebar) |
| Intermediária | 640–1179px | 508–919px (sidebar entra em 768) |
| Wide | ≥ 1180px | 920px+ |

**Não copiar o breakpoint `md:` da F091.** Lá a arte fica dentro da coluna de
conteúdo da aula; aqui, em 768px, a faixa tem 508px e a arte wide ficaria
ilegível. Os cortes são 640px e 1180px.

### 6.2 Dimensões

Todas em **CSS (1x)**; exportar em **@2x**, como as artes atuais.

| | **Mobile** | **Intermediária** | **Wide** |
|---|---|---|---|
| Canvas (1x) | **640 × 300** | **960 × 260** | **1920 × 300** |
| Exportar (@2x) | **1280 × 600** | **1920 × 520** | **3840 × 600** |
| Proporção | 2,13:1 | 3,69:1 | 6,4:1 |
| Altura renderizada | 150px (320) · 183px (390) · 300px (639) | 138px (508) · 208px (767) · 249px (919) | 144px (920) · 259px (1920) · 359px (2560) |
| Pior caso de escala | 0,50 (tela de 320) | 0,53 (faixa de 508) | 0,48 (faixa de 920) |

Só a **wide** mantém o canvas atual (3840×600). As outras duas mudam.

### 6.3 Tipografia mínima, por peça

Tamanho **no canvas 1x** (dobra no arquivo @2x). Cada número é o mínimo para o
elemento render legível no **pior caso** da coluna acima.

| Elemento | Mobile (canvas 640) | Intermediária (canvas 960) | Wide (canvas 1920) |
|---|---|---|---|
| Título | **60px** | **53px** | **59px** |
| Parágrafo / apoio | **28px** | **25px** | **28px** |
| "Toda quinta · às 20h" | **40px** | **34px** | **38px** |
| Texto do botão | **30px** | **27px** | **32px** |
| Altura do botão | **88px** | **76px** | **84px** |
| Margem de segurança | 48px | 38px | 64px |

A arte wide atual tem título ~52px e parágrafo ~21px no canvas de 1920 — os dois
abaixo do mínimo. O parágrafo precisa subir ~33%.

A altura do botão existe para alvo de toque: 88px no canvas mobile = 44px de
dedo na tela de 320px.

### 6.4 Zona de segurança

- **Wide**: título, data e botão dentro dos **62% à esquerda**. Em telas muito
  largas a faixa passa de 350px de altura, e a implementação corta pela direita
  (`max-h` + `object-position: left`) — o que for essencial não pode estar lá.
- **Mobile e intermediária**: os dois rostos no terço direito, pelo mesmo
  motivo.

### 6.5 Regras que valem para as três

1. Entregar **PNG** (viram WebP q90 em `public/banners/`, convenção da F091).
   Alvo de peso: < 250KB por peça depois da conversão.
2. **Tema claro**: as artes são escuras e continuam escuras nos dois temas.
   Consciente, mesma natureza da nota que a F086 deixou sobre o painel do login.
3. **`alt` obrigatório e completo**: todo o texto está dentro do PNG. O `alt`
   repete título, "toda quinta às 20h" e o CTA.
4. Enquanto as peças novas não vierem, a implementação usa as duas artes atuais
   com crop à esquerda — o texto e o botão sobrevivem, os rostos não.

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
7. Até 24/09, o Free vê a faixa da Imersão (não a de Bastidores); PRO e Elite
   veem a de Bastidores. Depois do prazo, todo mundo vê a de Bastidores. Nunca
   as duas juntas.
8. Num viewport de 390px, o texto do CTA renderiza a **≥14px**; num de 320px, o
   botão da arte renderiza com **≥44px de altura** (alvo de toque). A peça
   mobile atual não cumpre nenhum dos dois (decisão 6.3).
9. A faixa tem `alt` com título, dia/hora e CTA.
10. `npm run build` e `npm test` passam; sem import órfão de
    `whatsapp-grupo`/`LiveBanner`.

## Pendências (dependem do Ricardo)

- **As três peças de arte** nas dimensões e tipografia mínima de 6.2 e 6.3. A
  wide mantém o canvas atual (3840×600) e só corrige o tipo; mobile e
  intermediária são peças novas. Sem elas, a faixa sobe com as artes atuais
  cortadas à esquerda (6.5.4).
- **Confirmar que o link do Sendflow** é o destino do público Free (e não um
  grupo só de aluno).
- **A live de terça fica sem aviso nenhum dentro do produto.** Confirmado que o
  e-mail basta por ora.
