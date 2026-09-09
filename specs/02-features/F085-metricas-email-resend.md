# F085 — Métricas de e-mail (Resend) no Admin

## Status
Implementada — 2026-09-09

## Objetivo
Ver no Admin do Club (não no painel Resend) quantos e-mails foram
enviados / entregues / abertos / clicados, com filtro por **categoria**
(login, live, régua, respostas), **status** e **janela de dias**.

Foco do PO: abertura/clique dos lembretes de live, e separar login dos
demais disparos.

## Mapa de e-mails do Club

| Categoria | Funções | Exemplos de assunto |
|-----------|---------|---------------------|
| `login` | `sendMagicLinkEmail`, `sendOtpEmail` | Seu link de acesso — … / Seu código de acesso — … |
| `live` | `sendLiveLembreteEmail` | Amanhã tem live… / Começa em instantes… |
| `regua` | `sendRegua48hEmail`, `sendRegua7dEmail`, `sendRegua14dEmail` | Faz dois dias… / desafio de 7 dias… / duas semanas… |
| `respostas` | `sendReplyDigestEmail` | assuntos dinâmicos de resposta (F073) |
| `outro` | — | não casou (legado / teste) |

## Como categorizar

1. **Tag Resend** `category=<id>` no envio (API `POST /emails`) — fonte
   preferida.
2. **Fallback por assunto** — e-mails antigos enviados via SMTP sem tag.

Envio Resend deixa de usar SMTP e passa pela **HTTP API** (tags só
existem na API). Mailpit local inalterado. Sem lib `resend` — `fetch`
direto (sem ADR de lib nova).

## Envs

| Variável | Uso |
|----------|-----|
| `RESEND_API_KEY` | Chave da app Comunidade (listar + enviar). Preferida. |
| `RESEND_SMTP_PASS` | Fallback da mesma `re_…` se `RESEND_API_KEY` vazia (compat). |
| `RESEND_SMTP_FROM_EMAIL` | From (continua). |
| `RESEND_SMTP_HOST/USER/PORT` | Obsoletas no runtime Resend; podem ficar no `.env.example` como nota. |

Na Vercel: Production e Preview com a chave **desta** aplicação (já
separada das outras). Aba some / mostra aviso se a chave não estiver
configurada.

## Admin

Nova aba **E-mails** (`?tab=emails`):

- Filtros: dias (7 / 15 / 30), status (`all` \| last_event), categoria.
- Cards: totais enviados, delivered, opened, clicked (+ taxas).
- Gráfico de barras por status (CSS, sem lib de chart).
- Gráfico/barras por categoria (volume).
- Tabela resumida opcional dos últimos itens (to mascarado parcial).

Dados: `GET https://api.resend.com/emails` (paginado), agregação no
servidor. Não persiste no Postgres nesta entrega.

## Fora de escopo

- Webhook Resend → banco
- Card no Progresso / reunião CS
- Opt-out / preferências
- Recebidos (Receiving)

## Critérios

- [x] Spec antes do código
- [x] Envio Resend com tag `category`
- [x] Classificação por assunto para legado
- [x] Aba Admin com filtros dias / status / categoria
- [x] Gráficos de status e de categoria
- [x] Sem `RESEND_API_KEY`/`RESEND_SMTP_PASS`: aviso amigável, sem 500
