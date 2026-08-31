# F073 — Resposta: in-app no fio + e-mail agrupado

## Status
Implementado no código — 2026-08-31 (migration no Preview via `db:migrate:staging`)

> ID original no código era F072; renomeado para F073 porque
> `feature/F072-cadeado-thumb-bloqueada` já existia em paralelo.
> A pasta Prisma já aplicada em HML permanece `20260831200000_f072_reply_email`.

Depende de: [F006](F006-comentarios-reacoes.md), [F009](F009-notificacoes.md),
[F017](F017-notificacoes-ricas.md), [ADR-004](../04-decisions/ADR-004-email-transacional.md).

## Objetivo

Quem publica precisa **ver que responderam** — no site e fora dele.
Sem e-mail, o membro só descobre se abrir a plataforma; sem limite, um
e-mail por comentário vira spam e queima o domínio do login (OTP / magic
link).

Plano **A + B**:

- **A (in-app):** o autor do post é avisado de atividade no fio, inclusive
  resposta aninhada.
- **B (e-mail):** um aviso fora do app, **agrupado**, só para sinal alto.

## Limites (travados)

| | Entra | Não entra |
|---|---|---|
| In-app | comentário no post, resposta no comentário, menção, reação (como hoje) | — |
| E-mail | `comment_on_post`, `reply_on_comment`, `mention_in_post`, `mention_in_comment` | **reação** (`reaction_on_post`) |
| Agrupamento | no máximo **1 e-mail por destinatário por post a cada 2 horas** | um e-mail por comentário |
| Padrão | opted-in | digest da comunidade inteira, push, worker/fila |

Outras regras:

- Nunca notifica o autor da própria ação.
- Falha de e-mail **não** falha o comentário; tenta de novo no próximo evento fora da janela.
- Sem workers / filas: envio no request, debounce consultando o último envio daquele par (destinatário, post).
- Descadastrar: Configurações + link no e-mail (e `List-Unsubscribe`). Religa na mesma tela.
- Assunto com 1 evento: `{nome} respondeu no Builders Club`. Com 2+: `{n} respostas no Builders Club`.
- Corpo: trecho, link para `/posts/{id}`, nota de que reações não geram e-mail.

## A — in-app no fio

Hoje, “Responder” num comentário notifica só quem foi respondido. O autor
do post fica sem aviso se a conversa rolar no fio.

Passa a ser:

1. Quem foi respondido → `reply_on_comment` (se não for o próprio ator).
2. Autor do post → `comment_on_post`, **também em resposta aninhada**, se
   for outra pessoa e ainda não tiver sido avisado no passo 1.
3. Menções → `mention_in_comment`, sem duplicar quem já entrou em 1 ou 2.

Reação e menção em post não mudam.

## B — e-mail agrupado

Depois de gravar as notificações de sinal alto, para cada destinatário:

1. Se `Profile.notifyRepliesEmail` é false → não envia.
2. Se já houve envio para (destinatário, post) há menos de 2 horas → não envia.
3. Caso contrário, envia um e-mail com a contagem de não lidas daquele post
   (só tipos de sinal alto) e registra `NotificationEmailSend`.

Canal: o mesmo Resend / Mailpit do ADR-004. É transacional (a pessoa
publicou ou comentou). Não é newsletter.

## Fora de escopo

- E-mail de reação
- Digest diário / “o que rolou na comunidade”
- WebSocket / realtime
- Preferência por tipo (só o liga/desliga do e-mail de respostas)
- Religar pelo link do e-mail (o link só desliga; religa em Configurações)

## Critérios

- [x] Resposta aninhada notifica o autor do post (in-app), se for outra pessoa
- [x] Resposta ao próprio comentário do autor do post não duplica notificação
- [x] E-mail dispara para comentário / resposta / menção, nunca para reação
- [x] Segundo evento no mesmo post dentro de 2h não gera segundo e-mail
- [x] Opt-out em Configurações e no link do e-mail
- [x] Comentário continua gravado se o envio de e-mail falhar
