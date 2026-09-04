# Builders Club

Comunidade dos alunos da Dev em Dobro. Specs em `/specs`, PRD em `/docs/prd.md`.
Deploy e envs Vercel: [`docs/deploy-vercel.md`](docs/deploy-vercel.md).

## Domínios

| Ambiente | URL |
|----------|-----|
| Produção | https://comunidade-builders-club.devemdobro.com |
| Homologação | https://hml-comunidade-builders-club.devemdobro.com (atrás do SSO da Vercel) |

`builders-club.devemdobro.com` (sem o `comunidade-`) é uma landing estática de
outro projeto e dá 404 em toda rota deste app. Conferido em 04/09/2026 —
tabela de evidência em [`docs/deploy-vercel.md`](docs/deploy-vercel.md).

## Setup local

```bash
cp .env.example .env
# Gere BETTER_AUTH_SECRET (Node): node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

docker compose up -d
npm install
npx prisma migrate dev
npm run db:seed
npm run db:import-allowed -- --orion   # se tiver ORION_DATABASE_URL
npm run dev
```

Mailpit: http://127.0.0.1:8026 · App: http://localhost:3000

## Ambientes

```
feature/<id> → feature/preview → main
```

- Homolog: branch `feature/preview` + Neon HML + `hml-comunidade-builders-club.devemdobro.com`
- Produção: `main` + Neon prod + `comunidade-builders-club.devemdobro.com`
- Migrations HML: `npm run db:migrate:staging`
- Produção: migrate só após validar no Preview + confirmação explícita

## Features Fase 1

F001–F010 · F012 allowlist

## Manter HML ≈ prod (pré-lançamento)

```bash
npm run db:seed:envs -- --target=hml,prod
npm run db:import-allowed -- --orion --target=hml
npm run db:import-allowed -- --orion --target=prod
```
