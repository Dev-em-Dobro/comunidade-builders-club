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
- [x] `errorCallbackURL` **não** aninha o `callbackUrl` (Better Auth faz
      `decodeURIComponent` de novo no verify → dois `?` →
      `INVALID_CALLBACK_URL`). Erros usam `/login?error=…` simples.
- [x] `callbackUrl` sanitizado contra o regex do Better Auth **depois** do
      decode (UTM com colchetes `[LI28]` / `%5B` cai para o pathname).
