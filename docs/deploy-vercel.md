# Deploy Vercel + domínios (Builders Club)

## Domínios (Cloudflare → Vercel)


| Ambiente    | Domínio                                | Branch Vercel     |
| ----------- | -------------------------------------- | ----------------- |
| Produção    | `builders-club.devemdobro.com`         | `main`            |
| Homologação | `staging.builders-club.devemdobro.com` | `feature/preview` |


Sugestão alinhada ao Orion (`staging.orion-lead-hunter…`). Alternativas: `hml.builders-club…` ou `preview.builders-club…`.

### Cloudflare (DNS)

Para cada hostname (prod e staging):

1. Tipo **CNAME**, nome `builders-club` ou `staging.builders-club`
2. Alvo: `cname.vercel-dns.com` (ou o valor que a Vercel mostrar ao adicionar o domínio)
3. Proxy Cloudflare: **DNS only** (cinza) na 1ª propagação; depois pode ligar proxy se quiser

Na Vercel → Project → Settings → Domains:

- `builders-club.devemdobro.com` → Production
- `staging.builders-club.devemdobro.com` → Preview / branch `feature/preview`

---



## Variáveis de ambiente

Na Vercel, **não** use `DATABASE_URL_HML` / `DATABASE_URL_PROD` como nomes de runtime.
O app lê `DATABASE_URL`. O que muda é o **valor por Environment** (Production vs Preview).

As chaves `DATABASE_URL_HML` / `DATABASE_URL_PROD` / `ORION_DATABASE_URL` são só para scripts locais (`db:seed:envs`, `db:import-allowed`).

### Matriz (obrigatórias)


| Variável                | Production                             | Preview (staging)                              | Local                   |
| ----------------------- | -------------------------------------- | ---------------------------------------------- | ----------------------- |
| `DATABASE_URL`          | Neon **prod**                          | Neon **HML**                                   | Docker `127.0.0.1:5433` |
| `BETTER_AUTH_SECRET`    | secret forte (único)                   | secret forte (**outro** do prod)               | gerado local            |
| `BETTER_AUTH_URL`       | `https://builders-club.devemdobro.com` | `https://staging.builders-club.devemdobro.com` | `http://localhost:3000` |
| `EMAIL_PROVIDER`        | `resend`                               | `resend` (ou mailpit só local)                 | `mailpit`               |
| `BOOTSTRAP_ADMIN_EMAIL` | seu e-mail admin                       | mesmo ou de teste                              | seu e-mail              |
| `HUBLA_WEBHOOK_TOKEN`   | token do webhook Hubla                 | mesmo ou dedicado de staging                   | obrigatório p/ webhook  |
| `HUBLA_PRODUCT_ID`      | ID produto Builders Club (**obrigatório** no webhook) | mesmo                               | obrigatório p/ webhook  |


### Hubla (F014)

Na Hubla, configure o webhook apontando para:

- Prod: `https://builders-club.devemdobro.com/api/webhooks/hubla`
- Staging: `https://staging.builders-club.devemdobro.com/api/webhooks/hubla`

Header esperado: `x-hubla-token` = valor de `HUBLA_WEBHOOK_TOKEN`.

Sem `HUBLA_PRODUCT_ID` o endpoint responde **503** (não processa eventos de outros produtos).


### E-mail (Resend) — Production + Preview


| Variável                 | Exemplo                                       |
| ------------------------ | --------------------------------------------- |
| `RESEND_SMTP_FROM_EMAIL` | `Builders Club <noreply@mail.devemdobro.com>` |
| `RESEND_SMTP_HOST`       | `smtp.resend.com`                             |
| `RESEND_SMTP_PORT`       | `465`                                         |
| `RESEND_SMTP_USER`       | `resend`                                      |
| `RESEND_SMTP_PASS`       | API key Resend                                |


Domínio de envio precisa estar verificado no Resend (SPF/DKIM).

### Google OAuth (opcional)


| Variável               | Production / Preview                 |
| ---------------------- | ------------------------------------ |
| `GOOGLE_CLIENT_ID`     | mesmo projeto GCP ou um por ambiente |
| `GOOGLE_CLIENT_SECRET` | correspondente                       |


No Google Cloud Console → Authorized redirect URIs (Better Auth):

- `https://builders-club.devemdobro.com/api/auth/callback/google`
- `https://staging.builders-club.devemdobro.com/api/auth/callback/google`
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
3. [ ] Domínios staging + prod apontados (Cloudflare → Vercel)
4. [x] `npm run db:migrate:staging` (HML)
5. [ ] Seed spaces + allowlist nos Neons (repetir se Neon novo)
6. [ ] Webhook Hubla apontando staging (teste compra/cancelamento) e depois prod
7. [ ] Smoke: login magic link + Google, feed, reply, @menção, Markdown, bell, admin bulk, aula Panda
8. [ ] PR `feature/preview` → `main` após QA
9. [ ] `npm run db:migrate:prod -- --confirm` após merge em `main`
10. [ ] Comunicação aos alunos / liberação pública

