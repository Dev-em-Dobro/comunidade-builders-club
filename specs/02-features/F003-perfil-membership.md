# F003 — Perfil e Membership

## Status
Implementada — 2026-07-31

## Objetivo
Perfil (foto, nome, bio, joinedAt) + membership `pending|active|revoked`.
Feed exige `active`.

Acesso no 1º login via allowlist: [F012](F012-allowlist-acesso.md).

## Critérios
- [x] Perfil criado no primeiro login
- [x] Edição de nome/bio/foto
- [x] `requireActiveMember()` barra pending/revoked
- [x] Admin ativa membership (F010)
- [x] E-mail na allowlist → active sem aprovação manual (F012)
