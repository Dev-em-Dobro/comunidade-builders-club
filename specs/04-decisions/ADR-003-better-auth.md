# ADR-003 — Better Auth

## Status
Aceito — 2026-07-31

## Contexto
Login de membros sem senha, sessão server-side, adapter Prisma. Contas
**independentes** do Orion (sem SSO).

## Decisão
Better Auth + adapter Prisma. Métodos: **Google OAuth** + **magic link** +
**OTP por e-mail** (ADR-009 / F059, para o webview do Instagram).
Modelos: `User`, `Session`, `Account`, `Verification`.
Helper `requireUser()` / `requireActiveMember()` nas Server Actions.
Middleware protege rotas do app; `/login` e callbacks públicos.

## Alternativas
- SSO com Orion — adiado (complexidade + acoplamento).
- E-mail/senha — mais superfície (hash, reset); rejeitado no MVP.
- Clerk — dado fora do nosso banco.

## Consequências
Magic link depende de e-mail transacional (ADR-004). Google opcional no boot.
