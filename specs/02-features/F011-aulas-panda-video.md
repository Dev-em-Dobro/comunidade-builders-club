# F011 — Aulas com Panda Video (Fase 2)

## Status
Em implementação (pré-lançamento da comunidade)

## Objetivo
Catálogo de módulos/aulas com playback via Panda Video (ADR-005).

## Modelo

- `Module` — título, slug, descrição, ordem, publicado; `parentId` opcional
  (formação → módulo → submódulo · F050)
- `Lesson` — título, descrição em Markdown seguro (ADR-007), `pandaVideoExternalId`, `pandaLibraryId`, ordem, `moduleId`, publicado
- `LessonProgress` — userId, lessonId, seconds, completedAt (opcional no MVP)

Somente módulo **publicado** na raiz entra no catálogo do aluno. Rascunho
(e qualquer descendente) fica só no admin.

Descrição da aula: mesmo subset de posts (`**`, listas, `` ` ``, `##`, bloco
` ``` `). Links `http(s)` e downloads internos (`/caminho/arquivo.zip`)
abrem em **nova guia** (`target=_blank`). Anexos zip/md/docx entram como
link de download quando o arquivo estiver no storage; até lá a descrição
pode marcar o material como pendente.

## Critérios

- [x] Membro active lista módulos/aulas publicados
- [x] `/aulas` mostra cards dos módulos raiz; clique abre a lista
  (`/aulas/[moduleSlug]` · F052)
- [x] Player iframe Panda (`https://player-vz-{libraryId}.tv.pandavideo.com.br/embed/?v={externalId}`) + allowfullscreen
- [x] Admin CRUD módulos e aulas com IDs Panda
- [x] Admin reordena módulos/aulas (↑/↓ · F046)
- [x] Nav “Aulas” no shell
- [x] Progresso: marcar aula como concluída (sem Player API ainda)
- [x] Doc de migração entregáveis Orion atualizado com checklist operacional

## Dependências

ADR-005 · `specs/06-migracao-entregaveis-orion.md`
