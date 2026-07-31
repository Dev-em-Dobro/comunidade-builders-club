# ADR-001 — Stack TypeScript + Next.js

## Status
Aceito — 2026-07-31

## Contexto
Builders Club precisa de app web full-stack, SSR/App Router, hospedagem Vercel,
alinhado à stack que o time já usa no Orion.

## Decisão
Next.js 15 (App Router) + TypeScript estrito + Tailwind + shadcn/ui.
Lógica em `src/lib/`; Server Actions finas; Zod na borda.

## Alternativas
- Remix / SvelteKit — time sem contexto.
- SPA pura — pior SEO/login e DX de Server Actions.

## Consequências
Reuso de conhecimento do Orion; tema visual próprio (não copiar tokens).
