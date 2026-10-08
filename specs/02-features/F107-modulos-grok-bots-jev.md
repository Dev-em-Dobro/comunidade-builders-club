# F107 — Módulos: Grok Bots + JEV aplicado ao mundo real

## Status
Em implementação

## Objetivo
Dois módulos raiz no catálogo `/aulas` (pago, `freeAccess` false):

| slug | título | sortOrder |
|------|--------|-----------|
| `grok-bots-agentes-que-fazem-trabalho-por-voce` | Grok Bots — Agentes que fazem trabalho por você | 15 |
| `jev-aplicado-ao-mundo-real` | JEV aplicado ao mundo real | 16 |

Aulas/vídeos entram depois (módulos nascem sem lessons).

## Como aplicar (HML)

```bash
npm run db:seed:aulas-panda -- --target=hml
npx tsx scripts/publish-jornada-hml.mts --slugs=grok-bots-agentes-que-fazem-trabalho-por-voce,jev-aplicado-ao-mundo-real
```

## Critérios
- [x] Entradas no `CATALOG` de `scripts/seed-aulas-panda.mts`
- [x] Seed + publish em HML (`scripts/seed-f107-modulos-grok-jev.mts`)
- [ ] Cards visíveis em `/aulas` (HML) para PRO/Elite (conferir UI)
