# F087 — Modelo de CMS (material Builders Club)

## Status
Implementada — 2026-09-16

## Contexto
Na aba Materiais o card **Modelo de CMS** estava em `emBreve`. O template
operacional (`criador-de-cms-builders`) é empacotado em `.zip` e baixado pelo
aluno no Club — sem fork no GitHub no caminho principal (menos atrito pra
quem está começando).

Esta feature libera o entregável no Club com página completa (alunos leigos)
e documenta o fluxo pasta por cliente + Supabase + Vercel.

## Escopo

### No Club
- Tirar `cms` de `emBreve` no catálogo de entregáveis
- **F097:** `cms` (e `crm`) com `eliteOnly` — PRO não abre nem baixa
- Pasta `content/entregaveis/10-CMS/` com `index.html` self-contained (Ubuntu),
  `_GUIA-modelo-cms.md` e o zip pronto `criador-de-cms-builders.zip`
- Kit download via `kitZip.arquivoPronto` (serve o zip direto)
- Copy clara: o CMS **não** é o site do cliente; é o painel de edição
- Explicar o modelo **pasta por cliente** (não um app único com todos os
  clientes misturados no deploy)
- CTA principal: baixar o template em `.zip`

### No repositório template (criador-de-cms-builders)
- `docs/guia-alunos.md` (tutorial do zero)
- `templates/client-app/.env.example` (variáveis documentadas)
- Limpeza de resíduos de cliente no `.gitignore` do template
- Link do guia no README

## Fora de escopo
- Provisionamento automático na conta do aluno
- Alterar o core/CLI da fábrica além do necessário para docs/template
- Merge em `main` do Club (só `feature/preview`, salvo pedido explícito)
- Conteúdo real de clientes no template
- Exigir fork do GitHub no onboarding

## Critérios de aceitação
1. Em Materiais, **Modelo de CMS** aparece no menu (não em Em breve) e abre
   `/entregaveis/cms` com o hub HTML
2. A página explica: download do zip, config, `--skip-provision`, Supabase,
   `.env.local`, migrate/seed/dev, segundo cliente, Vercel
3. `/api/entregaveis/download/cms` entrega o template completo em `.zip`
4. O guia deixa explícito: **pasta `clients/<slug>/` por cliente**; deploy
   separado por Root Directory
5. No template: sem `.env` real, sem PII de cliente; só Demo Corp / exemplos
6. Spec e commits referenciam `F087`

## Relacionados
- Catálogo F020 (entregáveis)
- Repo: https://github.com/Dev-em-Dobro/criador-de-cms-builders
