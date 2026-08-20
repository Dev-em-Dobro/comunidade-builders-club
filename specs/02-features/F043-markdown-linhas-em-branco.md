# F043 — Preservar linhas em branco no Markdown

## Status
Implementada — 2026-08-20

## Objetivo
Linhas em branco digitadas no composer (Enter entre parágrafos) devem
aparecer na visualização do post/comentário — sem colapsar tudo num bloco
contínuo.

## Comportamento
- Linha vazia no body → espaçamento visual entre blocos (não descartar).
- Quebra simples (`\n` sem linha vazia) continua em `whitespace-pre-wrap`
  dentro do parágrafo.
- Subset Markdown (ADR-007) inalterado além do tratamento de linhas vazias.

## Critérios
- [x] Duas Enter no editor geram espaço visível na leitura
- [x] Listas e inline Markdown seguem funcionando
