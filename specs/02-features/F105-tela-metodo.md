# F105 — Tela Método: Comece por aqui (Manifesto)

## Status
Em implementação

Depende de: [F104](F104-menu-comece-por-aqui.md) (item de menu).

## Objetivo
O item **Método: Comece por aqui** abre uma página própria (`/metodo`), não a aula do M01.

Conteúdo:

1. Bloco **Leia com atenção** + **Manifesto do Builder**
2. Passo a passo (perfil, aulas do método, comunidade) + **WhatsApp Elite** (cadeado / popup se não Elite)
3. Menu aponta para `/metodo`

## Critérios
- [x] `/metodo` autenticado renderiza manifesto + passos
- [x] Menu “Método: Comece por aqui” → `/metodo` (não redireciona pra aula)
- [x] Não-Elite: passo WhatsApp com cadeado; clique abre upgrade Elite
- [x] Elite: passo WhatsApp com link (`NEXT_PUBLIC_WHATSAPP_ELITE_URL`) quando configurado
