# F048 — Primeiro login → Boas-vindas

## Status
Implementada — 2026-08-20

## Objetivo
No **primeiro acesso** à comunidade (perfil sem `welcomeSeenAt`), o membro
é redirecionado de `/` (feed) para `/spaces/boas-vindas`, em vez de cair
direto no feed.

## Comportamento
1. Login (magic link / Google) com callback padrão `/`.
2. Feed (`/`) vê `Profile.welcomeSeenAt == null` → `redirect` Boas-vindas.
3. Ao abrir Boas-vindas, grava `welcomeSeenAt = now()`.
4. Próximos logins / visitas ao feed: sem redirect.

Membros já existentes recebem `welcomeSeenAt` preenchido na migration
(igual a `joinedAt`) para não forçar onboarding de novo.

Callback explícito (ex. `/posts/…`) não passa pelo feed — não força
Boas-vindas nessa sessão (comportamento aceitável).

## Critérios
- [x] Novo membro: primeiro hit em `/` → Boas-vindas
- [x] Visitar Boas-vindas marca `welcomeSeenAt`
- [x] Membros antigos não são redirecionados em massa
