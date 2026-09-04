# Deploy Vercel + domínios (Builders Club)

## Domínios (Cloudflare → Vercel)

Projeto Vercel: `dev-em-dobros-projects/comunidade-builders-club`.


| Ambiente    | Domínio                                       | Branch Vercel     |
| ----------- | --------------------------------------------- | ----------------- |
| Produção    | `comunidade-builders-club.devemdobro.com`     | `main`            |
| Homologação | `hml-comunidade-builders-club.devemdobro.com` | `feature/preview` |


> ⚠️ **`builders-club.devemdobro.com` não é este app.** É uma landing page
> estática, de outro projeto Vercel. Ela responde 404 em `/login`, `/planos`,
> `/presentes/<slug>` e nos webhooks. Link publicado nesse host — em DM,
> automação ou anúncio — não abre o Presente, não grava `GiftVisit` e não cria
> cookie de origem (F059). Até 04/09/2026 este doc afirmava que ela era a
> produção; era o engano que esta tabela corrige.

> **HML está atrás do Vercel Deployment Protection (SSO).** Request deslogado é
> redirecionado para `vercel.com/sso-api`. Para abrir, esteja logado na Vercel
> com acesso ao time `Dev em Dobro's projects` — aba anônima não passa. O SSO é
> da Vercel, não do app: para testar a jornada anônima do Presente, deslogue do
> **Club**, não da Vercel.

### Cloudflare (DNS)

Para cada hostname (prod e HML):

1. Tipo **CNAME**, nome `comunidade-builders-club` ou `hml-comunidade-builders-club`
2. Alvo: `cname.vercel-dns.com` (ou o valor que a Vercel mostrar ao adicionar o domínio)
3. Proxy Cloudflare: **DNS only** (cinza) na 1ª propagação; depois pode ligar proxy se quiser

Na Vercel → Project → Settings → Domains:

- `comunidade-builders-club.devemdobro.com` → Production
- `hml-comunidade-builders-club.devemdobro.com` → Preview / branch `feature/preview`

---



## Variáveis de ambiente

Na Vercel, **não** use `DATABASE_URL_HML` / `DATABASE_URL_PROD` como nomes de runtime.
O app lê `DATABASE_URL`. O que muda é o **valor por Environment** (Production vs Preview).

As chaves `DATABASE_URL_HML` / `DATABASE_URL_PROD` continuam só para scripts locais (`db:seed:envs`, `db:import-allowed`).

`ORION_DATABASE_URL` também é **runtime** na aba Progresso (F057): leitura
das propostas e da primeira busca. Preview aponta para o Neon **staging** do
Orion; Production para o Neon **prod**. Sem a env, os dois cards do Orion
mostram indisponível (não zero).

### Matriz (obrigatórias)


| Variável                | Production                             | Preview (staging)                              | Local                   |
| ----------------------- | -------------------------------------- | ---------------------------------------------- | ----------------------- |
| `DATABASE_URL`          | Neon **prod**                          | Neon **HML**                                   | Docker `127.0.0.1:5433` |
| `BETTER_AUTH_SECRET`    | secret forte (único)                   | secret forte (**outro** do prod)               | gerado local            |
| `BETTER_AUTH_URL`       | `https://comunidade-builders-club.devemdobro.com` | `https://hml-comunidade-builders-club.devemdobro.com` | `http://localhost:3000` |
| `EMAIL_PROVIDER`        | `resend`                               | `resend` (ou mailpit só local)                 | `mailpit`               |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Project ID prod (F074, projeto Clarity próprio) | Project ID **staging** (outro projeto) | vazio = desligado |
| `BOOTSTRAP_ADMIN_EMAIL` | seu e-mail admin                       | mesmo ou de teste                              | seu e-mail              |
| `HUBLA_WEBHOOK_TOKEN`   | token do webhook Hubla                 | mesmo ou dedicado de staging                   | obrigatório p/ webhook  |
| `HUBLA_PRODUCT_ID`      | Produto Club (allowlist `product.id`) | mesmo | obrigatório p/ webhook se os dois abaixo vazios |
| `HUBLA_PRODUCT_ID_PRO`  | Produto PRO **separado** (se existir) | mesmo | opcional |
| `HUBLA_PRODUCT_ID_ELITE`| Produto Elite **separado** (se existir) | mesmo | opcional |
| `HUBLA_OFFER_ID_PRO`    | Offer id PRO no produto Club | mesmo | recomendado (PRO e Elite compartilham product.id) |
| `HUBLA_OFFER_ID_ELITE`  | Offer id Elite no produto Club | mesmo | recomendado |
| `HUBLA_CHECKOUT_URL_PRO` | Override checkout PRO | mesmo | opcional (default `pay.hub.la/XaY8…`) |
| `HUBLA_CHECKOUT_URL_ELITE` | Override checkout Elite | mesmo | opcional (default `pay.hub.la/v1Ss…`) |
| `ORION_APP_URL`         | URL do Orion (sidebar Elite) | mesmo | opcional |
| `ORION_DATABASE_URL`    | Neon Orion **prod** (F057) | Neon Orion **staging** | opcional (HML) |
| `TMB_WEBHOOK_TOKEN`     | Valor do webhook TMB (Mentoria)        | mesmo ou dedicado de staging                   | obrigatório p/ webhook TMB |
| `TMB_WEBHOOK_HEADER`    | Chave do header (default `x-tmb-token`)| mesmo                                          | opcional                |
| `CRON_SECRET`           | secret forte (F075 régua 48h)          | mesmo ou dedicado; cron da Vercel **não** roda no Preview | local p/ bater o endpoint |


### Hubla (F014)

Na Hubla, configure o webhook apontando para:

- Prod: `https://comunidade-builders-club.devemdobro.com/api/webhooks/hubla`
- HML: `https://hml-comunidade-builders-club.devemdobro.com/api/webhooks/hubla`
  (o SSO da Vercel barra chamada de fora; para a Hubla alcançar o HML é preciso
  liberar Protection Bypass no projeto)

Header esperado: `x-hubla-token` = valor de `HUBLA_WEBHOOK_TOKEN`.

Sem nenhum de `HUBLA_PRODUCT_ID` / `HUBLA_PRODUCT_ID_PRO` / `HUBLA_PRODUCT_ID_ELITE` / `HUBLA_OFFER_ID_PRO` / `HUBLA_OFFER_ID_ELITE` o endpoint responde **503**. PRO e Elite são ofertas do mesmo produto Club; o webhook casa `offers[].id` (F053).

### TMB Mentoria Freela (F047)

Na TMB (Vendas → Webhook):

- URL prod: `https://comunidade-builders-club.devemdobro.com/api/webhooks/tmb`
- **Chave:** `x-tmb-token` (ou o valor de `TMB_WEBHOOK_HEADER`)
- **Valor:** = `TMB_WEBHOOK_TOKEN` na Vercel

Codes liberados por default: `1AS249898VN` (PRO / Mentoria), `3XB272209KV` e
`9DW254247E5` (Elite boleto). Override Elite: `TMB_ELITE_CODES`.
DevQuest continua via seed sazonal (não passa neste webhook).


### E-mail (Resend) — Production + Preview


| Variável                 | Exemplo                                       |
| ------------------------ | --------------------------------------------- |
| `RESEND_SMTP_FROM_EMAIL` | `Builders Club <noreply@mail.devemdobro.com>` |
| `RESEND_SMTP_HOST`       | `smtp.resend.com`                             |
| `RESEND_SMTP_PORT`       | `465`                                         |
| `RESEND_SMTP_USER`       | `resend`                                      |
| `RESEND_SMTP_PASS`       | API key Resend                                |


Domínio de envio precisa estar verificado no Resend (SPF/DKIM).

### Cron (F075 — régua 48h)

Vercel Cron (só **Production**) chama `GET /api/cron/regua` todos os dias às
12:00 UTC (9h em Brasília) com `Authorization: Bearer CRON_SECRET`. Sem a
env, o endpoint responde 503.

Preview / HML: o cron da Vercel **não** roda. QA:

```
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  https://hml-comunidade-builders-club.devemdobro.com/api/cron/regua
```

O SSO da Vercel responde antes do app: sem bypass, este `curl` devolve 302 para
`vercel.com/sso-api`, não o JSON do endpoint.

O disparo não envia para quem ainda tem `lastSeenAt` null (evita blast no
dia do migrate). Primeiro heartbeat é o poll do sininho.

### Google OAuth (opcional)


| Variável               | Production / Preview                 |
| ---------------------- | ------------------------------------ |
| `GOOGLE_CLIENT_ID`     | mesmo projeto GCP ou um por ambiente |
| `GOOGLE_CLIENT_SECRET` | correspondente                       |


No Google Cloud Console → Authorized redirect URIs (Better Auth):

- `https://comunidade-builders-club.devemdobro.com/api/auth/callback/google`
- `https://hml-comunidade-builders-club.devemdobro.com/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/google`

Authorized JavaScript origins: os três hosts acima (sem path).

### Só local / scripts (não precisa na Vercel)


| Variável                     | Uso                                                                    |
| ---------------------------- | ---------------------------------------------------------------------- |
| `EMAIL_FROM` / `MAILPIT_URL` | Mailpit local                                                          |
| `DATABASE_URL_HML`           | scripts `--target=hml`                                                 |
| `DATABASE_URL_PROD`          | scripts `--target=prod`                                                |
| `ORION_DATABASE_URL`         | `db:import-allowed --orion`                                            |
| `DATABASE_URL_STAGING`       | alias de HML no `db:migrate:staging` (pode apontar pro mesmo Neon HML) |


---



## Checklist pós-domínio

1. Criar projeto Vercel ligado a `Dev-em-Dobro/comunidade-builders-club`
2. Preencher envs Production + Preview (tabela acima)
3. Adicionar domínios e apontar Cloudflare
4. `BETTER_AUTH_URL` = URL canônica de cada ambiente (sem trailing slash)
5. Rodar migrate + seed + allowlist no Neon de cada ambiente (já feito em HML/prod localmente; repetir se criar Neon novo)
6. Branch `feature/preview` para homolog; `main` para produção



## Fluxo Git

```
feature/<id> → PR → feature/preview → PR → main
```

## Fluxo de migrations (espelha o Git)

```
feature/*  →  db:migrate:staging (Neon HML)
     ↓ merge em feature/preview (QA)
main       →  db:migrate:prod -- --confirm (Neon prod)
```

- Em feature / preview: só HML.
- Em produção: só após merge em `main` + confirmação explícita (`--confirm`).

## Checklist de lançamento (comunidade)

Só liberar alunos quando **tudo** abaixo estiver ok:

1. [ ] Branch `feature/preview` com F013–F017 + F011 (aulas) deployada na Vercel Preview
2. [ ] Envs Preview + Production preenchidas (matriz acima, incl. `HUBLA_*`)
3. [x] Domínios HML + prod apontados (Cloudflare → Vercel)
4. [x] `npm run db:migrate:staging` (HML)
5. [ ] Seed spaces + allowlist nos Neons (repetir se Neon novo)
6. [ ] Webhook Hubla apontando staging (teste compra/cancelamento) e depois prod
7. [ ] Smoke: login magic link + Google, feed, reply, @menção, Markdown, bell, admin bulk, aula Panda
8. [ ] PR `feature/preview` → `main` após QA
9. [ ] `npm run db:migrate:prod -- --confirm` após merge em `main`
10. [ ] Comunicação aos alunos / liberação pública

---

## Verificação dos domínios — 04/09/2026

Os hosts desta página foram conferidos contra o que está no ar, não contra a
intenção de quem escreveu. Repetir antes de publicar link novo em automação:

| Host | `/login` | `/presentes/saga` | `POST /api/webhooks/hubla` | O que é |
|---|---|---|---|---|
| `comunidade-builders-club.devemdobro.com` | 200 | 200 | 401 | **o app** |
| `builders-club.devemdobro.com` | 404 | 404 | 404 | landing estática, outro projeto |
| `hml-comunidade-builders-club.devemdobro.com` | 302 SSO | 302 SSO | 302 SSO | HML atrás do Deployment Protection |
| `staging.builders-club.devemdobro.com` | — | — | — | **NXDOMAIN**, nunca existiu |

O alias de HML saiu de `vercel inspect` no deploy de `feature/preview`. O 401 no
webhook é a resposta certa: rota existe e recusou a chamada sem token. 404 é
rota inexistente — o sinal de que o host está errado.

