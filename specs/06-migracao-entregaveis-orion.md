# Migração dos entregáveis Orion → Builders Club (Fase 2)

## Contexto

Orion F020 embute entregáveis (HTML/assets) em `/entregaveis/[slug]`. O PRD
do Club prevê concentrar conteúdo/aulas na comunidade (F011).

## Estratégia

1. **Inventário** — listar slugs F020 (`scripts-venda`, `arsenal-sites`, …) e
   decidir o que vira Aula (vídeo Panda), o que vira documento estático, o que
   permanece link no Orion temporariamente.
2. **Upload/host** — vídeos no Panda; cadastrar `pandaLibraryId` +
   `pandaVideoExternalId` no Admin → Aulas do Club.
3. **Deep-link transitório** — Orion aponta para URL do Club
   (`/aulas/{module}/{lesson}`) enquanto ambos existem.
4. **Cutover** — após QA no Preview do Club: redirect 301/in-app no Orion;
   remover serving local F020.
5. **Specs** — atualizar F020 Orion + PRD Club quando o cutover for autorizado.

## Checklist operacional (pré-cutover)

- [ ] Inventário dos slugs F020 documentado (planilha ou issue)
- [ ] Vídeos correspondentes no Panda
- [ ] Módulos/aulas publicados no Club (HML → prod)
- [ ] Links de teste no staging do Club
- [ ] Plano de redirect no Orion aprovado
- [ ] Comunicação aos alunos

## Fora de escopo até cutover explícito

Nenhuma mudança no repositório Orion até confirmação do time após QA do Club.
