# 05 — Direção de design

## Referência

**Circle** — minimalista, Spaces na navegação, foco em leitura e mobile.

## Princípios

- Mobile first; feed como composição principal.
- Spaces: sidebar (desktop) / drawer (mobile).
- Cards só onde há interação (composer, post).
- Tipografia expressiva; hierarquia clara nome → body → meta.
- Fundo com leve textura ou gradiente (atmosfera de comunidade).
- **Não** clonar a UI do Orion Lead Hunter.
- Evitar look genérico “AI purple”, cream+serif terracotta, ou broadsheet denso.

## Tokens (MVP)

Definir em CSS variables / Tailwind theme:

- Fundo: tom frio escuro suave ou claro quente-neutro (escolher uma direção e manter).
- Direção escolhida: **claro neutro com acento teal/verde-água** (comunidade, frescor), tipografia sans com display levemente geométrica.
- Acento: teal (`--accent`).
- Texto: near-black / muted gray.
- Raio moderado (não pill excessivo).

## Superfícies

| Superfície | Conteúdo do primeiro viewport |
|------------|-------------------------------|
| Login | Marca Builders Club, CTA Google + magic link |
| Feed | Lista de posts + composer; nav spaces |
| Post | Conteúdo + reações + comentários |
| Perfil | Foto, nome, bio |
| Admin | Lista simples de ações de moderação |

## Motion

2–3 motions sutis: entrada do feed, hover em post, abertura do drawer de spaces.
