# F021 — Hardening de segurança

## Status
Implementado

## Objetivo
Remediar achados da análise de segurança pré-LGPD/lançamento:
entregáveis (iframe/CSP), webhook Hubla, embeds Panda, open redirect
no login, URLs `javascript:` e demotion de admins.

## Critérios
- [x] Iframe de entregáveis sem `allow-same-origin` + CSP no serve HTML/SVG
- [x] `HUBLA_PRODUCT_ID` obrigatório; token comparado com `timingSafeEqual`
- [x] IDs Panda validados (sem host injection)
- [x] `callbackUrl` só path relativo seguro (`/` interno)
- [x] `imageUrl` / `linkUrl` / `videoUrl` / `avatarUrl` só `https:`
- [x] Admin não demota outro admin nem altera o próprio papel
- [x] Headers de segurança básicos no `next.config`

## Arquivos principais
- `src/lib/security/urls.ts`
- `src/app/api/entregaveis/[...path]/route.ts`
- `src/app/(app)/entregaveis/[slug]/page.tsx`
- `src/app/api/webhooks/hubla/route.ts`
- `src/lib/aulas/index.ts`
- `src/lib/admin/members.ts`
- `next.config.ts`
