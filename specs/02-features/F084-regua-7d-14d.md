# F084 — Régua: 7 dias sem amostra e 14 dias sem atividade

## Status
Em implementação — 2026-09-08

## Objetivo

O toque de 48h (F075) puxa quem parou de **abrir** o Club. Ainda falta
puxar quem não publicou o desafio e quem sumiu de verdade (sem post,
comentário, reação ou aula). CS vê esses nomes no Progresso (F057) e
não consegue tocar em escala.

Mesmo cron, mesmo log (`regua_email_send.trigger`), dois e-mails novos.
WhatsApp continua fora.

## Quem recebe

Igual ao F075: membership `active`, papel `member` — **free e pago**.
Staff fora. Sem opt-out.

Free publica no Desafio Projetos (F065). O card de CS “ativados em 7
dias” continua só pagante (métrica de reunião). A régua é toque, não
denominador.

## 7 dias sem amostra

**Amostra** = post no space `projetos` com link público (`https://…` no
`linkUrl` ou no body) — mesma função do F057 (`postTemLinkPublico`).

Relógio: **entrada CS** (compra na loja se veio Hubla/TMB/Orion; senão
primeiro login). Dispara se a entrada foi há ≥ 7 dias e **nunca** houve
amostra.

Um e-mail **só**. Gravou `sem_amostra_7d` → não manda de novo, mesmo
sem amostra. Publicou antes do cron → não entra.

Copy: pedir para postar o desafio. CTA: `/spaces/projetos`.

## 14 dias sem atividade

Atividade = último post, comentário, reação ou `LessonProgress.updatedAt`.
**Não** é `lastSeenAt` (abrir o Club não zera este gatilho).

Quem nunca interagiu: relógio = entrada. Dispara se essa data é ≤ agora
− 14 dias.

Um e-mail **por episódio**, igual ao 48h: voltou a interagir e sumiu de
novo → pode disparar outra vez. Continuou parado → não spamma.

Copy: acompanhamento, não cobrança. CTA: abrir o Club.

## Independentes

Os três gatilhos não se bloqueiam. Quem casa 7d e 14d no mesmo run
recebe os dois (QA no Preview testa os dois num curl). Teto
`MAX_ENVIOS_POR_RUN` vale para o lote inteiro.

## Como dispara

`GET /api/cron/regua` (já existente). Query opcional, só com
`CRON_SECRET`:

| Param | Uso |
|---|---|
| `trigger` | `sem_acesso_48h` \| `sem_amostra_7d` \| `sem_atividade_14d` — omite = os três |
| `email` | restringe a um destinatário (HML / QA) |

Preview: cron da Vercel **não** roda. QA no HML com curl + filtro, senão
o primeiro 7d espalha para todo free sem amostra há 7+ dias.

## Fora de escopo

- WhatsApp / telefone / provedor
- 30d sem proposta no Orion
- Mudar os cards do Progresso
- Opt-out
- Migration de produção (não há schema novo)

## Critérios

- [x] Spec antes do código
- [x] 7d: member ativo, sem amostra, um e-mail, CTA Desafio Projetos
- [x] 14d: member ativo, sem atividade há 14d, um por episódio
- [x] Mesmo cron; QA com `trigger` + `email`
- [x] Testes das regras
- [ ] Preview / HML; produção só com confirmação
