# F011 — Aulas com Panda Video (Fase 2)

## Status
Em implementação (pré-lançamento da comunidade)

## Objetivo
Catálogo de módulos/aulas com playback via Panda Video (ADR-005).

## Modelo

- `Module` — título, slug, descrição, ordem, publicado; `parentId` opcional
  (formação → módulo → submódulo · F050)
- `Lesson` — título, descrição em Markdown seguro (ADR-007),
  `pandaVideoExternalId` e `pandaLibraryId` **opcionais** (aula só de
  material, sem player), ordem, `moduleId`, publicado
- `LessonProgress` — userId, lessonId, seconds, completedAt (opcional no MVP)

Somente módulo **publicado** na raiz entra no catálogo do aluno. Rascunho
(e qualquer descendente) fica só no admin.

Progresso do aluno (cards em `/aulas`, % na sidebar do player e
`/admin/progresso`): o denominador é **todas as aulas publicadas na
árvore**, inclusive aula só de material e submódulos de formação
(IA / n8n · F050/F052). Rascunho não entra. Publicar aulas novas baixa
o % de quem ainda não as concluiu. A lista do admin segue a ordem da
jornada (raiz → trilha → submódulo → aula), com o caminho do módulo.

Descrição da aula: mesmo subset de posts (`**`, listas, `` ` ``, `##`, bloco
` ``` `). Links `http(s)` e downloads internos (`/materiais/arquivo.zip`)
abrem em **nova guia** (`target=_blank`). Anexos zip/md/docx/xlsx ficam em
`public/materiais/` e entram como link de download na descrição.

Aula **sem vídeo Panda** é permitida quando o conteúdo é só material
(ex.: lista de templates). O player mostra um painel de material no
lugar do iframe.

## Critérios

- [x] Membro active lista módulos/aulas publicados
- [x] `/aulas` mostra cards dos módulos raiz; clique abre o player
  (`/aulas/[moduleSlug]/[lessonSlug]` · F052)
- [x] Player iframe Panda quando a aula tem `pandaVideoExternalId`;
  aula só de material não 404 — mostra painel no lugar do vídeo
- [x] Admin CRUD módulos e aulas com IDs Panda
- [x] Admin reordena módulos/aulas (↑/↓ · F046)
- [x] Nav “Aulas” no shell
- [x] Progresso: marcar aula como concluída (sem Player API ainda);
  % e admin usam a árvore publicada (inclui aula só de material)
- [x] Doc de migração entregáveis Orion atualizado com checklist operacional

## Dependências

ADR-005 · `specs/06-migracao-entregaveis-orion.md`
