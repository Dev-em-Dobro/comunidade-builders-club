# F124 — Módulo CRM com IA

## Status
Em implementação — 2026-10-29
Atualizada — 2026-11-24: template 1.0.5 e aula de WhatsApp via QR code.
Atualizada — 2026-11-27: aulas de deploy e de produção gravadas entram no seed.

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
| Pacote (aulas 1, 2 e QR) | `/materiais/crm-para-alunos-template-1.0.5.zip` |

Aulas com vídeo (Panda `video_external_id`, library `77c52f03-dc6`):

| ordem | slug | título | dashboard | external |
|-------|------|--------|-----------|----------|
| 0 | `visao-geral-do-crm` | Visão geral do CRM | `8c445873-…` | `ae0cabc2-254e-48ed-98cc-3daf0cfc6f13` |
| 1 | `arquivos-e-instalacao` | Arquivos e instalação | `a28959ba-…` | `d7b922aa-0484-45af-b0cc-41e1b9dfa6da` |
| 2 | `primeiro-acesso-e-configuracao` | Primeiro acesso e configuração | `5f3f35da-…` | `df983cd6-689f-4d6a-9406-bc2b77c6060a` |
| 3 | `agente-de-ia-e-catalogo` | Agente de IA e catálogo | `7ad502b0-…` | `4512a78a-88a6-4df1-a930-094f8941c82e` |
| 4 | `whatsapp-e-proximos-passos` | WhatsApp e próximos passos | `2cc54d51-…` | `fef3b100-d72d-4242-82e7-949bb9e67aa9` |
| 6 | `deploy-no-railway` | Deploy no Railway | — | `422f16ef-c630-4345-8ec6-888ddd708c6b` |
| 7 | `configurar-dominio-https-e-migrar-callbacks-da-meta` | Configurações em produção e WhatsApp | — | `8d4d0746-17fa-4454-879a-9fff355828d1` |

As aulas 6 e 7 foram gravadas depois e cadastradas direto em produção em
2026-11-06 (vídeo, título e descrição). O seed copia esses valores para não
apagá-los: o slug da aula 7 fica o antigo, só o título mudou.

Aula em texto (publicada, sem `pandaVideoExternalId`, descrição não começa
com “Em breve”):

| ordem | slug | título |
|-------|------|--------|
| 5 | `whatsapp-via-qr-code` | WhatsApp via QR code (sem Meta) |

Aula Em breve (publicada, sem `pandaVideoExternalId`):

| ordem | slug | título |
|-------|------|--------|
| 8 | `testes-de-aceitacao-operacao-custos-e-backup` | Testes de aceitação, operação, custos e backup |

Aula sem vídeo cuja descrição começa com “Em breve” mostra **Em breve**
no player (não “Aula em texto”) e um selo na lista lateral.

## Template 1.0.5 e WhatsApp via QR

O pacote passa do template 1.0.4 para o **1.0.5**. A novidade que entra no
módulo é o canal **WhatsApp via QR** (provedor WAHA, não oficial): o aluno
conecta o número lendo um QR code no onboarding do CRM, sem app na Meta, sem
aprovação e sem janela de 24 horas. A API oficial (aula 4) continua valendo;
os dois canais podem ficar ligados juntos.

- O ZIP novo tem nome com versão, para o aluno não baixar o 1.0.4 por cache.
- Aulas 1 e 2 apontam para o ZIP 1.0.5; a aula 4 aponta para a aula do QR.
- A aula do QR traz os riscos (conexão não oficial, um número por
  instalação), o passo a passo local e os erros comuns, com base no guia
  `WHATSAPP_QR.md` do pacote.
- O ZIP 1.0.4 (`/materiais/crm-para-alunos-template.zip`) continua
  publicado até o seed rodar em produção; depois pode ser removido.

## Seed

`scripts/seed-aulas-panda.mts` (CATALOG) +
`scripts/seed-f124-crm-com-ia.mts` + `scripts/aulas-descricoes-data.mts`.
HML por padrão; produção com `--target=prod --confirm`. Capa e ZIP no
deploy (`main`).

O seed sobrescreve vídeo, título e descrição de todas as aulas do módulo.
Aula gravada ou editada pelo admin em produção precisa entrar no seed antes
da próxima rodada, senão volta para o que está no script.

## Critérios

- [ ] Card CRM com IA no catálogo, com capa, sem badge Em breve no card
- [ ] Cinco aulas com vídeo, na ordem da pasta Panda
- [ ] ZIP 1.0.5 na descrição da aula 1 (e apontado nas aulas 2 e do QR)
- [ ] Aula “WhatsApp via QR code” logo depois da aula 4, como Aula em texto
- [ ] Deploy no Railway e Configurações em produção com vídeo, depois do QR
- [ ] Só “Testes de aceitação…” fica como Em breve, sem player
- [ ] Rodar o seed em produção não apaga vídeo, título nem descrição atuais
- [ ] `freeAccess` permanece `false`
- [ ] Embed usa `video_external_id`, não o UUID do dashboard
