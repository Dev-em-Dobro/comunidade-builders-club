# Builders Club

Comunidade dos alunos da Dev em Dobro. Specs em `/specs`, PRD em `/docs/prd.md`.
Deploy e envs Vercel: [`docs/deploy-vercel.md`](docs/deploy-vercel.md).

## Domínios

| Ambiente | URL |
|----------|-----|
| Produção | https://builders-club.devemdobro.com |
| Homologação | https://staging.builders-club.devemdobro.com |

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

- Homolog: branch `feature/preview` + Neon HML + domínio staging
- Produção: `main` + Neon prod + `builders-club.devemdobro.com`
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
