# ADR-002 — Neon Postgres + Prisma

## Status
Aceito — 2026-07-31

## Contexto
Persistência relacional para membros, spaces, posts, notificações. Banco
**separado** do Orion.

## Decisão
PostgreSQL no Neon + Prisma ORM. Migrations versionadas.
Staging: `DATABASE_URL_STAGING`; produção: `DATABASE_URL`.

## Alternativas
- Supabase Auth+DB — acopla auth SaaS; rejeitado (Better Auth no nosso Neon).
- Drizzle — válido; time já usa Prisma no Orion.

## Consequências
Dois Neons (Orion + Club); disciplina de migrate staging-first.
