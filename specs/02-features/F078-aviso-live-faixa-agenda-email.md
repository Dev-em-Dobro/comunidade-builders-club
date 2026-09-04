# F078 — Aviso de live: faixa fixa + agenda + lembrete por e-mail

## Status
Em especificação — 2026-09-04

## Objetivo

Presença nas lives é métrica de entrega e de engajamento. Hoje não existe
nenhum aviso sistemático: quem esquece, some. Esta entrega ataca o
esquecimento com três peças que reforçam o mesmo horário:

1. **Faixa fixa** no topo do Club com a data/hora da próxima live.
2. **Botão de agenda** na faixa, pra marcar sem digitar nada.
3. **Lembrete por e-mail**, na véspera e pouco antes do horário.

WhatsApp fica de fora **desta** entrega — vira [F079](F079-aviso-live-whatsapp.md)
(a criar), porque exige telefone do aluno (campo novo + LGPD), escolha de
provedor e ADR próprio. Decisão registrada em conversa com o time em
2026-09-04.

Rastreio de quem **de fato** entrou na live (presença real, via
Zoom/Meet/Panda) também fica fora — isto aqui é aviso, não medição de
presença.

## Quem vê / quem recebe

- **Faixa**: todo membro com `membership.status = active`, qualquer papel
  — inclusive staff (admin/instructor também precisam lembrar da própria
  live).
- **E-mail de lembrete**: `membership.status = active`, `role = member`
  — free, pro, elite e `paid`. Staff fica de fora, mesma regra do
  [F075](F075-regua-email-48h.md).
- **Sem opt-out.** Mesmo racional do F075: é aviso operacional de um
  compromisso da comunidade, não preferência do aluno.

## Modelo: horário da próxima live

Live é semanal e o horário quase nunca muda ("geralmente terças às 20h"),
mas quando muda é pontual — os gêmeos avisam pra uma semana específica.
Modelar como **regra fixa + exceção pontual**, não como agenda completa:

- `LiveSchedule` (linha única, tipo config):
  - `weekday` (0–6, default `2` = terça)
  - `hour` / `minute` (default `20:00`)
  - `nextOverrideAt` (`DateTime?`) — horário exato da **próxima**
    ocorrência quando ela foge da regra. Preenchido pelo admin só quando
    muda; some sozinho da conta assim que essa data fica no passado (não
    precisa limpar campo, a função de cálculo já ignora override
    vencido).

`proximaLive(now)` em `src/lib/live/regras.ts` (sem Next, testável):

```
se nextOverrideAt existe e é > now → usa nextOverrideAt
senão → próxima ocorrência de weekday/hour/minute a partir de now
```

Depois que a live passa, o cálculo já aponta pra semana seguinte sem
nenhuma ação manual — só existe toque humano quando o horário **foge**
da regra.

## Faixa fixa

- **Onde**: `AppShell`, acima do conteúdo, em todo o Club (decisão do
  time — máxima visibilidade pra métrica de presença).
- **Não dispensável.** "Faixa fixa" é o pedido; sem estado de
  fechar/lembrar depois (mesmo racional do F069: manter estado por
  aluno é problema a mais pra resolver por um empurrão que deve ser
  visto sempre).
- **Conteúdo**: "Próxima live: {dia da semana} {dd/mm} às {hh:mm}" +
  botão **Marcar na agenda**.
- **Botão de agenda**: abre o Google Calendar com o evento pré-preenchido
  (link `calendar.google.com/calendar/render?action=TEMPLATE&...`, sem
  backend, sem arquivo gerado). Duração fixa de 60 min pro cálculo do
  fim do evento. Outras plataformas (Outlook, .ics pra baixar) ficam de
  fora do MVP — cobre a maioria e evita gerar/servir arquivo.
- Mobile: título e botão empilham, mesma linguagem visual das faixas
  existentes (F069).

## Lembrete por e-mail

Dois disparos por ocorrência, mesma lógica de dedupe do F075 adaptada
pro relógio da live (não pro `lastSeenAt`):

- `LiveReminderSend` (log, análogo ao `regua_email_send`):
  `userId`, `trigger` (`vespera` \| `pouco_antes`), `liveAt` (o
  `startsAt` exato daquela ocorrência), `sentAt`. Dedupe por
  `(userId, trigger, liveAt)` — dispara de novo automaticamente na
  semana seguinte porque `liveAt` muda.
- **`vespera`**: quando a próxima live cai dentro das próximas ~24–32h.
  Cron diário cobre essa janela sem problema.
- **`pouco_antes`**: quando a próxima live está a ~1h de distância.
  Exige granularidade mais fina que "1x por dia" — ver risco abaixo.
- Template novo em `src/lib/email/index.ts`
  (`sendLiveLembreteEmail`), reaproveitando `ADR-004` (Resend/Mailpit,
  sem lib nova). Tom de lembrete de agenda, não de cobrança — mesmo tom
  do F075. CTA: abrir o Club.
- Falha de um destinatário não aborta o lote (mesmo padrão do F075).

## Granularidade do cron — resolvido

Projeto está no plano Vercel Pro, que aceita cron mais frequente que
1x/dia. `GET /api/cron/live-lembrete` roda a cada 15 min
(`*/15 * * * *` no `vercel.json`) — uma rota só, cobrindo os dois
triggers: a janela de 24–32h (`vespera`) e a de até 1h (`pouco_antes`)
antes do horário calculado por `proximaLive()`. Dedupe por
`(userId, trigger, liveAt)` garante que rodar a cada 15 min não duplica
envio.

## Admin

Nova seção na aba Admin (mesma navegação por abas do F035): editar
`weekday`/`hour`/`minute` (regra padrão) e `nextOverrideAt` (exceção da
próxima ocorrência). Validação: `nextOverrideAt`, se preenchido, precisa
estar no futuro. Sem tela nova de "histórico de lives" — só o horário
vigente.

## Fora de escopo

- WhatsApp automático (F079, com ADR)
- Rastreio de presença real (quem entrou de fato)
- .ics / Outlook / outras plataformas de calendário
- Opt-out do lembrete
- Duração configurável do evento (fixo 60 min)
- Histórico/arquivo de lives passadas
- Migration de produção (só após Preview/HML + confirmação, como sempre)

## Critérios

- [ ] Spec revisada antes do código
- [ ] `LiveSchedule` + `proximaLive()` (regra padrão + override pontual, testado)
- [ ] Admin edita regra padrão e override
- [ ] Faixa fixa no topo do Club, visível a todo membro `active` (inclusive staff), não dispensável
- [ ] Botão "Marcar na agenda" abre Google Calendar com data/hora/duração corretas
- [ ] Cron véspera: 1 e-mail por ocorrência, elegibilidade igual ao F075 (free+pago, staff fora)
- [x] Cron pouco-antes: 1 e-mail por ocorrência — mecanismo de agendamento confirmado (Vercel Pro, `*/15 * * * *`)
- [ ] Testes da regra de `proximaLive()` e da elegibilidade de envio (dedupe por `liveAt`)
- [ ] Preview / HML antes de produção
