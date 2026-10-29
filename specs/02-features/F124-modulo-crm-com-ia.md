# F124 — Módulo CRM com IA

## Status
Em implementação — 2026-10-29

## Objetivo

Módulo raiz novo no catálogo `/aulas` da comunidade, pago (`freeAccess`
false), só no Builders Club (não vai ao DevQuest). Capa genérica
(`/10-crm.png`). As 5 aulas já gravadas na pasta Panda
`13ce862e-116f-41b9-868e-4e2e384637e7` entram publicadas, na ordem do
arquivo. Três aulas futuras nascem visíveis como **Em breve**, sem vídeo.

## Conteúdo

| Campo | Valor |
|-------|-------|
| Módulo | `crm-com-ia` — CRM com IA |
| `sortOrder` | 17 (JEV vai para 18) |
| Capa | `/10-crm.png` |
| Pacote (aula 1) | `/materiais/crm-para-alunos-template.zip` |

Aulas com vídeo (Panda `video_external_id`, library `77c52f03-dc6`):

| ordem | slug | título | dashboard | external |
|-------|------|--------|-----------|----------|
| 0 | `visao-geral-do-crm` | Visão geral do CRM | `8c445873-…` | `ae0cabc2-254e-48ed-98cc-3daf0cfc6f13` |
| 1 | `arquivos-e-instalacao` | Arquivos e instalação | `a28959ba-…` | `d7b922aa-0484-45af-b0cc-41e1b9dfa6da` |
| 2 | `primeiro-acesso-e-configuracao` | Primeiro acesso e configuração | `5f3f35da-…` | `df983cd6-689f-4d6a-9406-bc2b77c6060a` |
| 3 | `agente-de-ia-e-catalogo` | Agente de IA e catálogo | `7ad502b0-…` | `4512a78a-88a6-4df1-a930-094f8941c82e` |
| 4 | `whatsapp-e-proximos-passos` | WhatsApp e próximos passos | `2cc54d51-…` | `fef3b100-d72d-4242-82e7-949bb9e67aa9` |

Aulas Em breve (publicadas, sem `pandaVideoExternalId`):

| ordem | slug | título |
|-------|------|--------|
| 5 | `deploy-no-railway` | Deploy no Railway |
| 6 | `configurar-dominio-https-e-migrar-callbacks-da-meta` | Configurar domínio HTTPS e migrar os callbacks da Meta |
| 7 | `testes-de-aceitacao-operacao-custos-e-backup` | Testes de aceitação, operação, custos e backup |

Aula sem vídeo cuja descrição começa com “Em breve” mostra **Em breve**
no player (não “Aula em texto”) e um selo na lista lateral.

## Seed

`scripts/seed-aulas-panda.mts` (CATALOG) +
`scripts/seed-f124-crm-com-ia.mts`. HML por padrão; produção com
`--target=prod --confirm`. Capa e ZIP no deploy (`main`).

## Critérios

- [ ] Card CRM com IA no catálogo, com capa, sem badge Em breve no card
- [ ] Cinco aulas com vídeo, na ordem da pasta Panda
- [ ] ZIP na descrição da aula 1 (e apontado na aula 2)
- [ ] Três aulas seguintes visíveis como Em breve, sem player
- [ ] `freeAccess` permanece `false`
- [ ] Embed usa `video_external_id`, não o UUID do dashboard
