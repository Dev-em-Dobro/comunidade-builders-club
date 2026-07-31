# Migração dos entregáveis Orion → Builders Club (Fase 2)

## Contexto

Orion F020 embute entregáveis (HTML/assets) em `/entregaveis/[slug]`. O PRD
do Club prevê concentrar conteúdo/aulas na comunidade.

## Estratégia proposta

1. **Inventário** — listar slugs F020 (`scripts-venda`, `arsenal-sites`, …) e
   decidir o que vira Aula (vídeo Panda), o que vira documento estático, o que
   permanece link no Orion temporariamente.
2. **Upload/host** — vídeos no Panda; docs estáticos no Club (rota autenticada)
   ou storage.
3. **Deep-link transitório** — Orion aponta para URL do Club enquanto ambos
   existem.
4. **Cutover** — após QA no Preview do Club: redirect 301/in-app no Orion;
   remover serving local F020.
5. **Specs** — atualizar F020 Orion + PRD Club; feature F011 no Club.

## Fora de escopo (Fase 1)

Nenhuma mudança no Orion até Fase 2 iniciar com confirmação explícita.
