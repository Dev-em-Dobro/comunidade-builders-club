# F020 — Termos, Privacidade e LGPD

## Status
Implementado

## Objetivo
Páginas públicas de Termos de Uso e Política de Privacidade, alinhadas ao
Orion, adaptadas ao Builders Club.

## Critérios
- [x] `/termos` e `/privacidade` públicas (sem login; fora do matcher do middleware)
- [x] Operador / e-mail: mesmos dados legais do Orion (`OPERADOR_LEGAL`)
- [x] Conteúdo adaptado à comunidade (não ao Lead Hunter)
- [x] Links no login
- [x] Data de atualização visível
- [x] Cookie `bc_origem` e `GiftVisit` (sem IP) descritos na política (F059)

## Arquivos
- `src/lib/legal.ts`
- `src/components/pagina-legal.tsx`
- `src/app/termos/page.tsx`
- `src/app/privacidade/page.tsx`
- `src/components/login-form.tsx`
