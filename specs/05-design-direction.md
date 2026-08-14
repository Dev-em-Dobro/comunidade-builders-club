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

Tema **claro** (padrão) e **escuro** (F042). Acento teal nos dois.

| Token | Claro | Escuro |
|-------|--------|--------|
| Fundo | `#f3f6f5` | `#0b1211` |
| Card | `#ffffff` | `#141c1a` |
| Acento | `#0d9488` / hover `#0f766e` | `#14b8a6` / hover `#2dd4bf` |
| Surface | `#e7efed` | `#1a2422` |
| Sidebar | `#fafcfb` | `#101816` |
| Texto | `#0f172a` | `#e8eeec` |
| Muted | `#64748b` | `#8b9a96` |
| Borda | `#dde5e2` | `#24302d` |

- Radius: 12–16px (não pill excessivo)
- Sidebar: fundo sólido, space ativo com surface + accent
- Preferência de tema no dispositivo (`localStorage`); não segue o SO por padrão.

## Superfícies

| Superfície | Notas F013 |
|------------|------------|
| Login | Hero tipográfico + painel auth com ar |
| Feed | Composer destacado; empty state tipográfico |
| Post | Avatar, meta, barra de ações discreta |
| Mobile | Header sticky + drawer Spaces |

## Motion

Entrada fade dos posts; drawer slide; hover suave no post-card.
