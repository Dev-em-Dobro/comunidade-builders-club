# F054 — Tentativas de entrada com e-mail não autorizado

## Status
**UI desligada** — 2026-09-07 (decisão do dono). Gravação opcional mantida
para histórico; a aba Admin **Tentativas** e o card de atenção **não**
voltam sem nova decisão.

## Por quê desligar (07/09)
A fila foi criada para achar aluno pago trancado do lado de fora. Em 04/09
o cruzamento mostrou que ela mede outra coisa: a maioria das linhas nasce
no **mesmo minuto** da conta — rastro do cadastro pelo presente, não aluno
preso. Em 07/09 havia dezenas de linhas sem resolução → alarme falso na
visão de admin. A métrica saiu do placar da reunião.

A pergunta original já está respondida: allowlist sem conta **não** aparece
em `denied_login_attempt` (ninguém tentou) e não há local-part cruzado com
conta em outro domínio. Não é bug de login nem e-mail trocado.

**Não** construir card substituto “comprou e não entrou”: decomposição por
origem mostrou preferência (lotes DevQuest), não falha de entrega.

## Objetivo (histórico)
Quem **pagou** com um e-mail e tenta entrar com **outro** some do radar:
não vira a conta da compra, não aparece em Membros pelo e-mail da Hubla/TMB,
e o resgate de “N dias sem login” só vê quem já tem `User`.

Esta feature **grava cada pedido de entrada** cujo e-mail **não** está na
allowlist. A lista de 14 dias na Admin foi **retirada** (ver Status).

## Contexto (comportamento atual)

O Club é freemium ([F041](F041-funil-freemium.md)): o magic link **é enviado**
mesmo fora da allowlist — a pessoa entra como `free`. Não existe um “código
que recusa o link”. O buraco é outro:

1. Compra na Hubla/TMB grava o e-mail da **nota** na allowlist.
2. Aluno digita o e-mail **pessoal** no login.
3. Nasce um membro **free** (conta existe — mas não a da compra).
4. O e-mail da compra fica na allowlist **sem** `User`.

Por isso a lista não é só “recusa de porta”. É: **e-mail que pediu para
entrar e não era o autorizado da compra**.

O Orion tem o mesmo tipo de desalinhamento (entitlement vs e-mail digitado),
em banco separado. Esta spec é **só Club**. Orion replica o padrão numa
feature própria — não compartilha tabela.

## Modelo

`DeniedLoginAttempt`

| Campo | Tipo | Significado |
|-------|------|-------------|
| `email` | string | E-mail digitado, lowercase |
| `app` | string | Sempre `club` nesta base (export/espelho futuro) |
| `createdAt` | datetime | Quando pediu o link / criou a conta |
| `resolvedAt` | datetime? | Ops marcou como tratada (ou liberou o e-mail) |

Índices: `(createdAt)`, `(email, createdAt)`.

Dedupe: se o mesmo e-mail já foi gravado nos **últimos 30s**, não cria
outra linha (duplo clique).

## Quando grava

No pedido de **magic link** e na **criação de User** (Google / primeiro
magic link), se `isEmailAllowed(email)` for falso.

Não grava se o e-mail já está na allowlist. Falha ao gravar **não** impede
o envio do link nem o login (F041).

Não muda a copy da tela de login.

## Admin — aba Tentativas (`?tab=tentativas`)

**Removida da UI (07/09).** O código de listagem/actions pode permanecer
morto ou ser limpo depois; a decisão de produto é: **sem card pedindo
atenção**.

## Critérios

- [x] Pedido de magic link com e-mail fora da allowlist grava `DeniedLoginAttempt`
- [x] Criação de User (Google) fora da allowlist grava
- [x] E-mail na allowlist **não** grava
- [x] Login / envio do link **não** quebra se a gravação falhar
- [x] Cadastro free continua funcionando (F041)
- [x] Aba Admin **Tentativas** **desligada** — sem lista/card na visão de admin
- [ ] ~~Ops libera e-mail pela aba~~ — fluxo aposentado com a UI

## Fora de escopo

- Recusar magic link / matar o funil free
- Consultar API Hubla/TMB por e-mail
- Enviar e-mail transacional de “achamos sua compra”
- Orion (spec irmã)
- IP, user-agent, audit log genérico ([F016](F016-admin-ops.md))
