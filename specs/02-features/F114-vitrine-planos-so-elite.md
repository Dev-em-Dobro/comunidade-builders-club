# F114 — Vitrine `/planos` só Elite

## Status
Implementada — 2026-10-21

Depende de: [F053](F053-ofertas-pro-elite.md) (ofertas, checkouts Hubla, webhook).

## Contexto

A página `/planos` mostrava duas colunas: PRO (botão **Assinar mensal** +
botão **Entrar no PRO anual**) e Elite. Pedido da operação: esconder Mensal
e PRO na vitrine, deixando só a coluna Elite. Quem já é PRO/mensal continua
com o mesmo acesso — a mudança é só o que a tela de planos oferece para
compra nova.

## Decisão

1. Lista `PLANOS_VISIVEIS_NA_VITRINE` em `src/lib/membership/checkout.ts`.
   Hoje: `["elite"]`. Helper `vitrineMostra(chave)` decide se o card/botão
   entra na página.
2. `/planos` (vitrine atual) e `/planos-v2` (`PlanCards`, layout antigo)
   leem a lista. Checkout Hubla, webhook, allowlist e permissões **não**.
3. Com uma coluna só, o card fica centralizado (`max-w-xl`), sem buraco de
   grid no desktop nem no mobile.
4. Não apagar `ofertaPro()`, `ofertaProMensal()`, URLs Hubla, IDs de oferta
   nem mapeamento de webhook.
5. Outros CTAs de upgrade (banner de boas-vindas, modal de bloqueio, aulas,
   configurações, etc.) **não mudam** nesta feature — seguem levando a
   `/planos`, que agora só vende Elite.

## Reverter

Incluir `"pro"` e `"proMensal"` em `PLANOS_VISIVEIS_NA_VITRINE` (e o teste
da vitrine). Os cards e botões voltam a renderizar.

## Fora de escopo

- Remover PRO/mensal do banco, da Hubla ou do webhook
- Reescrever copy de outras telas que citam o PRO
- Checkout direto de PRO fora de `/planos` (não há CTA de checkout PRO
  fora da vitrine e do layout antigo)

## Critérios

- [x] `/planos` não mostra botão "Assinar mensal" nem "Entrar no PRO anual"
- [x] `/planos` mostra a coluna Elite com o checkout Hubla intacto
- [x] Uma coluna só: card centralizado, sem buraco de grid (desktop e mobile)
- [x] Ofertas PRO/mensal, webhook e permissões continuam no código
- [x] Lista `PLANOS_VISIVEIS_NA_VITRINE` é o único interruptor da vitrine
