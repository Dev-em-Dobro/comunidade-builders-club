# F011 — Aulas com Panda Video (Fase 2)

## Status
Planejada — não implementar na Fase 1

## Objetivo
Catálogo de módulos/aulas com playback via Panda Video (ADR-005).

## Modelo (previsto)

- `Module` — título, ordem
- `Lesson` — título, descrição, `pandaVideoExternalId`, `pandaLibraryId`, ordem, `moduleId`
- `LessonProgress` (opcional) — userId, lessonId, seconds, completedAt

## Critérios (quando implementar)

- [ ] Membro active lista módulos/aulas
- [ ] Player iframe Panda + allowfullscreen
- [ ] Admin CRUD aulas com IDs Panda
- [ ] Progresso opcional via Player API

## Dependências

ADR-005 · migração entregáveis Orion (`specs/06-migracao-entregaveis-orion.md`)
