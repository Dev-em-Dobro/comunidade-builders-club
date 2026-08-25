# F057 — Métricas de CS na aba Progresso

## Status
Implementado — 2026-08-24

## Objetivo
A reunião semanal de CS olha números, não impressão. A aba **Progresso dos
alunos** já tem alunos, aulas, posts e reações — falta o **cruzamento**
(ativação, parado, proposta, Free) **separado por plano**.

Em 28/08/2026 o Instagram passa a trazer cadastro gratuito. Free não posta,
só lê. Se Free e pagante caírem no mesmo denominador, a taxa de ativação
despenca por composição, não por piora. Os cards **já nascem separados**.

## Onde
`/admin/progresso`, junto dos cards que já existem. Só admin. Cada card
abre a lista de alunos (número no card, nomes no clique). Sem planilha.

## Recorte

Filtro: **entrada ≥ 2026-08-24 00:00** `America/Sao_Paulo`. Quem entrou
antes segue no WhatsApp e **não** entra nestes cards.

Admin e instructor ficam de fora. Membership `revoked` também.

### Relógio (`entrada`)

| Origem | Relógio |
|--------|---------|
| **Pagante** (allowlist de loja `hubla` / `tmb` / `orion` com `createdAt` ≤ entrada do login + 24h) | data da **compra** = `AllowedEmail.createdAt` |
| **Free** (não veio da loja) | **primeiro login** = `Profile.joinedAt` (fallback `Membership.createdAt`) |

Quem demora a logar depois de pagar **não** ganha 7 dias extra: o prazo
já correu na compra. Quem é Free não tem compra — o relógio é o login.

A origem **congela na entrada**. Free que vira Pro no meio do caminho
continua Free nestes denominadores de ativação/conversão; entra nos
cards de pagante só onde o recorte é “está pago agora” (parados e
propostas).

### Semana fechada

Segunda 00:00 → segunda seguinte 00:00, fuso `America/Sao_Paulo`.
A semana **visível** é a última **completa** (a que fecha na segunda).
Terça a domingo ainda mostram a semana que fechou na segunda anterior.

Zero é resposta, não erro. Até o Instagram (28/08) os cards de Free
devem dar zero ou quase.

## Cards de pagante (Pro + Elite; `paid` legado = Pro)

### 1. Ativados em 7 dias

- **Y** = alunos **origem pagante** cujo prazo (`entrada` + 7 dias) caiu
  **dentro da semana fechada**.
- **X** = desses, os que postaram **link público** no space `projetos`
  (Desafio Projetos) com `createdAt ≤ entrada + 7 dias`.

Link público: `Post.linkUrl` `https://…` (não `builders-club://`) **ou**
URL `https://` no body.

Mostrar **X de Y** e a série das **últimas 4 semanas** fechadas. Uma
semana isolada com 2–3 pessoas é ruído.

Quem já publicou mas **ainda está no prazo** não entra em Y: conta na
semana em que os 7 dias completam. Na segunda, Y é quem entrou entre
8 e 14 dias atrás.

Lista no clique: os Y, marcando quem está em X.

### 2. Parados há 14 dias

Alunos **com plano pago agora** (Pro/Elite/`paid`), no recorte de
entrada, cuja última atividade (post, comentário, reação ou aula —
`LessonProgress.updatedAt`) foi há **≥ 14 dias**, ou nunca tiveram
atividade e a entrada foi há ≥ 14 dias.

Lista no clique: esses nomes. Sem nome não vira resgate.

### 3. Propostas enviadas na semana

Cruzamento **só leitura** com o Orion (`ORION_DATABASE_URL`), por e-mail
(lowercase). **Proposta enviada** = Lead com `status = proposta` e
`status_em` na semana fechada.

A geração do PDF no Orion **não** grava linha (F012): o marco que existe
é o aluno marcar o Lead como `proposta`. Se o Lead já foi pra `ganho`,
esta semana **não** o reconta (não há histórico de status).

Lista: alunos do recorte (plano pago agora) que têm pelo menos um Lead
assim. Sem `ORION_DATABASE_URL` o card mostra indisponível — **não**
zero.

## Cards de Free (origem Free)

### 4. Entradas no Free na semana

Número absoluto: origem Free com `entrada` na semana fechada.

### 5. Free ativados em 3 dias

Mesma lógica do card 1, janela de **3 dias**, marco = **primeira busca
no Orion** = `MIN(lead.created_at)` daquele e-mail.

- **Y** = origem Free cujo `entrada + 3 dias` caiu na semana fechada.
- **X** = desses, primeira coleta ≤ `entrada + 3 dias`.

Sem Orion configurado: indisponível, não zero.

### 6. % de Free que virou Pro no mês

Mês calendário corrente em `America/Sao_Paulo` (não a semana fechada).

- **Y** = origem Free com `entrada` neste mês.
- **X** = desses, `Membership.tier` ∈ `pro` \| `elite` \| `paid` agora.

Mostrar **X de Y (Z%)**. Y = 0 → `0 de 0`, sem porcentagem.

## Fora de escopo

- Recortar os cards antigos de aulas/posts (continuam no total da base).
- Gravar histórico de troca de tier.
- Consultar API Hubla/TMB.
- Worker/fila (ADR-002 do Club).
- Nova lib de gráfico.

## Critérios

- [x] Cards pagante e Free separados no Progresso
- [x] Recorte entrada ≥ 24/08/2026
- [x] Card 1 = X de Y + série 4 semanas; prazo completa na semana fechada
- [x] Card 2 lista nomes parados ≥ 14 dias
- [x] Card 3 cruza Orion por e-mail (Lead `proposta`)
- [x] Cards 4–6 Free; conversão é mês calendário
- [x] Clique abre nomes; zero é válido
- [x] Admin/instructor fora
