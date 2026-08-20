# F044 — Rótulos amigáveis da allowlist

## Status
Implementada — 2026-08-20

## Objetivo
O campo `AllowedEmail.source` não deve aparecer cru como `(admin)` na UI —
isso confunde com o papel de administrador da membership.

## Comportamento
- Admin UI mostra label humana por `source` (ex.: `admin` / `manual` →
  “import manual”; `hubla` → “Hubla”; `devquest` → “DevQuest”).
- Novos e-mails adicionados um a um pelo admin usam `source=manual`
  (em vez de `admin`).

## Critérios
- [x] Lista allowlist não exibe o texto literal `(admin)` como rótulo
- [x] Origens conhecidas têm label legível
