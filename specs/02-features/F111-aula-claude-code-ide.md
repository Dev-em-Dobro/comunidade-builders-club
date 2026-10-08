# F111 — Primeira aula do Claude Code

## Objetivo

Publicar a primeira aula do módulo pago `claude-code` em HML. O card sai de
“Em breve” quando a aula publicada entra no catálogo. Ordem: Gravações (12),
Codex (13), Claude Code (14), Grok Bots (15), JEV (16).

## Conteúdo

| Campo | Valor |
|-------|-------|
| Módulo | `claude-code` |
| Aula | `claude-code-na-ide` — Claude Code na IDE |
| Panda library | `77c52f03-dc6` |
| Panda video | `3ec9d2a0-d36f-4c43-b652-1d0e57f10f18` |
| Capa do módulo | `/7-claude-code.webp` |
| Material | `/materiais/claude-code-print-lp.zip` |

A descrição explica instalação e uso na IDE, informa que Claude Code requer
Claude Pro e que as técnicas de desenvolvimento e revisão também servem para
outras IAs. Inclui o guia da aula e o download do ZIP.

## Publicação

`scripts/seed-f111-claude-code-aula.mts --target=hml` atualiza somente os
quatro módulos da sequência e a aula Claude Code, sem alterar produção. A
publicação depende do deploy da capa e do ZIP no Preview.

## Critérios

- Card Claude Code aparece imediatamente depois do Codex e sem “Em breve”.
- Aula abre o vídeo Panda e mostra guia, descrição e link funcional do ZIP.
- `freeAccess` permanece `false`.
- Produção permanece sem a aula até aprovação após HML.
