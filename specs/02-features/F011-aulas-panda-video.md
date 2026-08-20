# F011 — Aulas com Panda Video (Fase 2)

## Status
Em implementação (pré-lançamento da comunidade)

## Objetivo
Catálogo de módulos/aulas com playback via Panda Video (ADR-005).

## Modelo

- `Module` — título, slug, descrição, ordem, publicado
- `Lesson` — título, descrição, `pandaVideoExternalId`, `pandaLibraryId`, ordem, `moduleId`, publicado
- `LessonProgress` — userId, lessonId, seconds, completedAt (opcional no MVP)

## Critérios

- [x] Membro active lista módulos/aulas publicados
- [x] Player iframe Panda (`https://player-vz-{libraryId}.tv.pandavideo.com.br/embed/?v={externalId}`) + allowfullscreen
- [x] Admin CRUD módulos e aulas com IDs Panda
- [x] Admin reordena módulos/aulas (↑/↓ · F046)
- [x] Nav “Aulas” no shell
- [x] Progresso: marcar aula como concluída (sem Player API ainda)
- [x] Doc de migração entregáveis Orion atualizado com checklist operacional

## Dependências

ADR-005 · `specs/06-migracao-entregaveis-orion.md`
