# F108 — Claude Code + Codex (Em breve) + badge no catálogo

## Status
Em implementação

## Objetivo
1. Módulos raiz **Claude Code** e **Codex** (pago, sem aulas).
2. Badge **Em breve** nos cards sem aulas (Grok Bots, JEV, Claude Code, Codex).

| slug | título | sortOrder |
|------|--------|-----------|
| `claude-code` | Claude Code | 15 |
| `codex` | Codex | 16 |

## HML

```bash
npx tsx scripts/seed-f108-modulos-em-breve.mts --target=hml
```

## Critérios
- [x] Seed + CATALOG
- [x] Badge “Em breve” no card quando `contentCount === 0`
- [ ] Conferir `/aulas` em HML
