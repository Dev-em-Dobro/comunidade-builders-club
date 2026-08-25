# F054 — Tentativas de entrada com e-mail não autorizado

## Status
Implementado — 2026-08-24

## Objetivo
Quem **pagou** com um e-mail e tenta entrar com **outro** some do radar:
não vira a conta da compra, não aparece em Membros pelo e-mail da Hubla/TMB,
e o resgate de “N dias sem login” só vê quem já tem `User`.

Esta feature **grava cada pedido de entrada** cujo e-mail **não** está na
allowlist e mostra os últimos **14 dias** na Admin, para o aluno invisível
virar uma linha que alguém olha.

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

Janela: `createdAt >= agora − 14 dias`. Agrupa por e-mail: quantidade,
primeira e última tentativa, se já existe `User` (e o tier), se já foi
tratada.

Lista de apoio na mesma aba: e-mails da **allowlist sem `User`** (compra
que nunca entrou com o e-mail da loja) — mais recentes primeiro, até 100,
sem filtro de 14 dias. É o lado da compra que o resgate por conta não vê.

Cruzamento automático (só palpite, não é prova): mesmo **local-part**
(`joao@` pessoal vs `joao@empresa`). Ops confirma na Hubla/TMB.

## O que se faz com cada linha

Não há correção automática de e-mail (falso positivo vira acesso pago na
conta errada). Fluxo:

1. Abrir a linha. Ver palpite + “compra sem login”.
2. Confirmar na Hubla/TMB se é a mesma pessoa.
3. **Adicionar o e-mail digitado à allowlist** (não apaga o da compra —
   os dois passam a entrar). Se já existir `User` free, [F012](F012-allowlist-acesso.md)/[F053](F053-ofertas-pro-elite.md)
   promove para `pro` (não rebaixa `elite`).
4. **Avisar no e-mail da compra** (o da loja), fora do app — Hubla/TMB ou
   e-mail da ops. O Club **não** dispara e-mail sozinho neste corte.
5. **Marcar como tratada** (automático ao liberar o e-mail; ou manual se
   for ruído / cadastro free sem compra).

## Critérios

- [x] Pedido de magic link com e-mail fora da allowlist grava `DeniedLoginAttempt`
- [x] Criação de User (Google) fora da allowlist grava
- [x] E-mail na allowlist **não** grava
- [x] Login / envio do link **não** quebra se a gravação falhar
- [x] Aba Admin **Tentativas** lista os últimos 14 dias (só admin)
- [x] Ops pode adicionar o e-mail à allowlist e marcar a linha como tratada
- [x] Cadastro free continua funcionando (F041)

## Fora de escopo

- Recusar magic link / matar o funil free
- Consultar API Hubla/TMB por e-mail
- Enviar e-mail transacional de “achamos sua compra”
- Orion (spec irmã)
- IP, user-agent, audit log genérico ([F016](F016-admin-ops.md))
