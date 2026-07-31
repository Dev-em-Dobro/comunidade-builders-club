# F002 — Autenticação

## Status
Em implementação · ADR-003, ADR-004

## Objetivo
Login Google + magic link; middleware; `requireUser()`.

## Critérios
- [x] Sem sessão → redirect `/login`
- [x] Google cria/reusa User
- [x] Magic link autentica
- [x] Logout encerra sessão
- [x] Envs `BETTER_AUTH_*` sem default
