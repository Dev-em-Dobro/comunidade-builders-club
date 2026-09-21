# F098 — Submódulo Fundamentos GPT Maker

## Status
Implementada — 2026-09-21

## Contexto

Dentro de **Fundamentos do Builder Profissional** faltava a trilha de
agentes no GPT Maker. As aulas já estavam na pasta Panda
`fda4fce4-fbb1-4875-baa3-bc220e4a14bd` (ordem 1→4).

## Decisão

1. Criar o filho `fundamentos-gpt-maker` sob
   `fundamentos-do-builder-profissional` (árvore F050).
2. Quatro aulas na ordem do folder, com `video_external_id` do Panda e
   descrições no seed + `aulas-descricoes-data.mts`.
3. As aulas “clássicas” (CNPJ, contrato, etc.) continuam na raiz do
   produto; o GPT Maker aparece como segundo bloco na sidebar.

## Aulas

| # | Slug | Título | Panda `video_external_id` |
|---|------|--------|---------------------------|
| 1 | `criar-conta-e-falar-com-o-suporte` | Criar conta e falar com o suporte | `758a08a8-…` |
| 2 | `criacao-de-agente` | Criação de agente | `acb7eaa0-…` |
| 3 | `conectando-o-agente-ao-whatsapp` | Conectando o agente ao WhatsApp | `1129e2f1-…` |
| 4 | `integracao-google-agenda-no-gpt-maker` | Integração Google Agenda no GPT Maker | `3430e386-…` |

## Critérios

1. Sidebar de Fundamentos mostra o bloco **Fundamentos GPT Maker**
2. Player abre as 4 aulas na ordem acima
3. Cada aula tem descrição (markdown) na aba de detalhes
4. Seed idempotente; publicar a árvore no HML/preview

## Fora de escopo

- Capas novas / rearrange das aulas clássicas
- Conteúdo avançado de GPT Maker além desses 4 vídeos
