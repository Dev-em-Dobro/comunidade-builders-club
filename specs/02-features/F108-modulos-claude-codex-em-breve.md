# F108 — Claude Code + Codex (Em breve) + badge no catálogo

## Status
Em implementação

## Objetivo
1. Módulos raiz **Claude Code** e **Codex** (pago). Codex ganhou aula na
   [F110](F110-aula-codex-do-zero.md); Claude Code segue sem aulas.
2. Badge **Em breve** nos cards sem aulas (`contentCount === 0`: Grok Bots,
   JEV, Claude Code).

| slug | título | sortOrder |
|------|--------|-----------|
| `codex` | Codex (aula · F110) | 13 |
| `claude-code` | Claude Code | 16 |

## HML

```bash
npx tsx scripts/seed-f108-modulos-em-breve.mts --target=hml
```

## Critérios
- [x] Seed + CATALOG
- [x] Badge “Em breve” no card quando `contentCount === 0`
- [ ] Conferir `/aulas` em HML
