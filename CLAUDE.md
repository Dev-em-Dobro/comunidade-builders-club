# Builders Club

> Repositório: `comunidade-builders-club`.
> Marca / comunidade dos alunos da Dev em Dobro.

Plataforma de comunidade (inspirada no Circle) para engajamento dos membros —
substitui a comunicação concentrada no WhatsApp. Produto **separado** do Orion
Lead Hunter: mesma família de stack, **contas e banco independentes**.

Visão em `specs/00-product-vision.md`, domínio em `specs/01-domain-model.md`,
PRD em `docs/prd.md`.

## Regras absolutas

- **Specs em `/specs` são a fonte da verdade.** Código segue spec, nunca o contrário.
- **Mudança de comportamento exige mudança de spec ANTES do código.**
- **Toda feature tem ID** (`F001`, `F002`, ...). Commits e PRs referenciam o ID.
- **Linguagem ubíqua** em `/specs/01-domain-model.md`. Não misturar termos do Orion
  (não é "Lead", "Diagnóstico", "Outreach").
- **Sem nova lib sem ADR** em `/specs/04-decisions/`.

## Stack fixa

- Next.js 15 (App Router) + TypeScript estrito
- PostgreSQL (Neon) + Prisma
- Tailwind + shadcn/ui (tema próprio — não clonar Orion)
- Better Auth (Google OAuth + magic link, sem senha)
- E-mail transacional (Resend SMTP / Mailpit em dev)
- Server Actions + Zod; lógica em `src/lib/` sem dependência de Next
- **Sem workers / filas** no MVP — notificações in-app no request
- Fase 2: Panda Video para aulas (ADR dedicado)

## Convenções

- Lógica de domínio em `src/lib/`
- Server Actions em `src/actions/`, finas
- Tipos derivados do Prisma
- UI em `src/components/`

## Fluxo de trabalho

1. Ler a spec em `/specs/02-features/F00X-*.md`
2. Implementar contra critérios de aceitação
3. Validar no Preview
4. Commit `F00X: <descrição>`

## Ambientes

```
feature/<id> → PR → feature/preview → PR → main
```

- Staging: Neon staging + Vercel Preview
- Produção: só via `main` + confirmação explícita para migrate
