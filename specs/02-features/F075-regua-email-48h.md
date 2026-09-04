# F075 — Régua de contato: e-mail aos 48h sem acesso

## Status
Em implementação — 2026-09-02

## Objetivo

CS não vê quem sumiu até o card de 14 dias (F057). Quem some no segundo
dia já perdeu o ritmo. Um e-mail transacional **automático** quando o
membro (free ou pago) não abre o Club há 48h. Serve para o CS
identificar e reativar quem parou de acessar. WhatsApp automático fica
de fora (sem telefone, sem API, sem ADR).

Os outros três gatilhos (7d sem amostra, 14d sem atividade, 30d sem
proposta no Orion) **não** disparam nesta entrega. A tabela de envio já
nasce com `trigger` para eles entrarem depois sem migração de modelo.

## Quem recebe

Membership `active`, papel `member` — **free, pro, elite e `paid`**.
Staff (admin / instructor) não entra.

**Sem opt-out.** Não há checkbox em Configurações nem link de
descadastro. Quem desmarcou a flag antiga `notifyReguaEmail` continua
recebendo: o cron **não** lê essa coluna. É e-mail da operação (CS),
não preferência do aluno.

## Relógio

`Session.updatedAt` não serve: o cookie cacheia 5 min e muita navegação
não grava sessão. **`Profile.lastSeenAt`**, tocado no poll de
notificações (já roda com o app aberto), no máximo a cada 15 min.

`lastSeenAt` null = relógio ainda não armou. **Não dispara.** Evita
e-mail em massa no dia do deploy. Quem entra e some: o poll grava o
primeiro `lastSeenAt`; 48h depois o cron dispara.

## Um e-mail por episódio de ausência

Dispara se:

- `lastSeenAt` ≤ agora − 48h
- e não existe envio deste `trigger` **depois** desse `lastSeenAt`

Voltou (`lastSeenAt` > último envio) e sumiu de novo → pode disparar
outra vez. Ficou sumido → um e-mail, não um por dia.

## Como dispara

Vercel Cron (produção) chama `GET /api/cron/regua` com
`Authorization: Bearer CRON_SECRET`. Sem workers/filas. HML/Preview:
cron da Vercel **não** roda; QA bate o endpoint na mão.

Lógica em `src/lib/regua/` (sem Next). Falha de um destinatário não
aborta o lote. Envios em série (Resend).

## Copy

Tom de acompanhamento, não de cobrança. CTA: abrir o Club
(`BETTER_AUTH_URL`). Sem link para parar estes e-mails.

## Fora de escopo

- WhatsApp / SMS / push
- Staff
- Opt-out / preferência do aluno
- Amostra, 14d, proposta
- Tela nova no admin (CS continua com Progresso F057; o log
  `regua_email_send` é a prova de quem foi tocado)
- Migration de produção (só após preview + confirmação)

## Critérios

- [x] Spec antes do código
- [x] `lastSeenAt` no poll (throttle 15 min)
- [x] Cron 48h só `member` active (free e pago), automático, um por episódio
- [x] Sem opt-out (Configurações e List-Unsubscribe)
- [x] Testes da regra de disparo
- [ ] Preview / HML; produção só com confirmação
