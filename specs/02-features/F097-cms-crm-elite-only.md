# F097 — CMS e CRM só no Elite

## Status
Implementada — 2026-09-21

Depende de: [F053](F053-ofertas-pro-elite.md), [F087](F087-modelo-cms-material.md),
[F019](F019-entregaveis.md) (se existir) / catálogo de materiais.

## Problema

Materiais era um único gate **PRO+**: quem tem PRO abria o **Modelo de CMS**
igual ao Elite. A oferta passou a tratar CMS (e CRM, quando sair de Em breve)
como diferencial do **Elite**. Sem gate por item, o PRO baixa o zip direto.

## Decisão

1. Campo `eliteOnly?: boolean` no catálogo (`cms` e `crm`).
2. Página `/entregaveis`: card Elite com selo; PRO vê cadeado + CTA para
   `/planos?motivo=materiais-elite&destaque=elite` (sem Abrir / Baixar).
3. `/entregaveis/[slug]` e APIs (`download/[slug]`, `[...path]`): exigem
   Elite se o item for `eliteOnly` (pasta `10-CMS` mapeada pelo catálogo).
4. CRM continua `emBreve` até ter conteúdo; já nasce com `eliteOnly`.
5. Staff (`admin`/`instructor`) segue com acesso (como em `isEliteMembership`).

## Critérios

1. PRO não abre `/entregaveis/cms` nem baixa o zip (redirect / 401/403)
2. Elite (e staff) abrem e baixam normalmente
3. Demais materiais continuam PRO+
4. Card do CMS na lista mostra que é Elite para quem é PRO
5. Copy F053 / card Elite alinhados (CMS incluso no Elite; não no PRO)

## Fora de escopo

- Liberar o CRM de Em breve (só o gate)
- Agente WhatsApp
- Mudar o menu lateral (continua um link Materiais PRO+)
