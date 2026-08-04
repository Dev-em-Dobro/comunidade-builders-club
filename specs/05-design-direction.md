# 05 — Direção de design

## Referência

**Circle** — minimalista, Spaces na navegação, foco em leitura e mobile.
F013 eleva o shell e o feed sem abandonar o teal.

## Princípios

- Mobile first; feed como composição principal.
- Spaces: sidebar fixa desktop (~260px) / drawer mobile.
- Feed central `max-w-5xl` (Boas-vindas `max-w-6xl`); shell full-bleed (não coluna estreita flutuante).
- Cards só onde há interação (composer, post).
- Tipografia: Outfit (display) + DM Sans (corpo); hierarquia nome → body → meta.
- Fundo com leve textura/gradiente (atmosfera de comunidade).
- **Não** clonar a UI do Orion Lead Hunter.
- Evitar look genérico “AI purple”, cream+serif terracotta, ou broadsheet denso.

## Tokens

- Fundo: claro neutro `#f3f6f5`
- Card: `#ffffff` com borda suave e sombra leve
- Acento: teal `#0d9488` / hover `#0f766e`
- Surface: `#e7efed`
- Radius: 12–16px (não pill excessivo)
- Sidebar: fundo card sólido, space ativo com surface + accent

## Superfícies

| Superfície | Notas F013 |
|------------|------------|
| Login | Hero tipográfico + painel auth com ar |
| Feed | Composer destacado; empty state tipográfico |
| Post | Avatar, meta, barra de ações discreta |
| Mobile | Header sticky + drawer Spaces |

## Motion

Entrada fade dos posts; drawer slide; hover suave no post-card.
