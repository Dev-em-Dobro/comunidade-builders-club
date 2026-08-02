# ADR-007 — Markdown seguro (subset in-house)

## Status
Aceito — 2026-08-02

## Contexto
Posts e comentários precisam de formatação leve (negrito, links, listas) sem
expor XSS. “Sem nova lib sem ADR”; um subset controlado evita dependência
extra no MVP.

## Decisão
Renderizar Markdown **seguro** em `src/lib/markdown/` com parser próprio:
escape HTML + regras limitadas (`**`, `*`, `` ` ``, links http(s), listas,
quebras). Menções `@DisplayName` viram links/spans após escape.

Não usar `dangerouslySetInnerHTML` com markdown bruto de libs sem sanitização.

## Alternativas
- `react-markdown` + `rehype-sanitize` — ok, mas nova lib; adiar se o subset
  cobrir o uso.
- Editor TipTap — fora do escopo pré-lançamento.

## Consequências
Subset documentado na UI; se precisar de tabelas/HTML rico, abrir ADR para
lib sanitizada.
