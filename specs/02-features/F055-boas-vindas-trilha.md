# F055 — Boas-vindas: vídeo + trilha de 3 passos

## Status
Implementado — 2026-08-24

## Objetivo
A tela de Boas-vindas deixa de ser um mural de cards. Cinco cards
competindo não é trilha: o aluno lê e não segue. Fica **só o vídeo do
tutorial** e **um card “Primeiros passos”** com três linhas — o que dá
para cumprir no primeiro dia.

## Condição (conteúdo, fora desta PR de UI)

A **primeira aula** da jornada (M01 Comece por aqui) é o **tutorial da
comunidade** — o mesmo vídeo desta tela. O tutorial fala do space
**Conquistas**. No primeiro módulo entra uma aula/desafio: landing page
para um estabelecimento de alguém que o aluno conhece, postar em
Conquistas para a equipe avaliar. Ativação de 7 dias, primeiro projeto
próprio, ainda sem venda.

Essa aula/desafio é conteúdo (Panda + catálogo). Esta feature só limpa
a tela. Ver [F051](F051-jornada-fase-1-e-2.md).

## Tela `/spaces/boas-vindas`

Sai:

- card hero “Bem-vindo…”
- “Como usar a plataforma”
- “Para que serve cada Space”
- “Comentários, reações e menções”
- “Materiais e aulas”

Fica:

1. Título do space + uma linha de contexto
2. Player Panda (`tutorial-intro-comunidade`, já em
   [F023](F023-boas-vindas-feed-modal.md) / `WELCOME_TUTORIAL_VIDEO`)
3. Um card **Primeiros passos**:
   1. Completar o perfil → `/perfil`
   2. Assistir as aulas → `/aulas`
   3. Postar na comunidade quando tiver dúvida ou conquista →
      `/spaces/duvidas` e `/spaces/conquistas`

Navegação (Feed, Spaces, menções, materiais) **não ganha casa nova**:
é o que o vídeo já ensina.

Layout: vídeo em destaque (2 colunas no `lg`); o card da trilha ao
lado no desktop, abaixo no mobile. Sem modal de orientação.

Comentários no space Boas-vindas continuam desligados (F023).

## Seed

`scripts/seed-welcome-cards.mts` deixa de criar o mural. Atualiza
**Primeiros passos** e **apaga** os posts marcados dos cards que saíram
(idempotente). Rodar em HML depois do merge.

## Critérios

- [x] `/spaces/boas-vindas` mostra o tutorial Panda
- [x] Um único card **Primeiros passos** com as três linhas acima
- [x] Não renderiza os cinco cards antigos (mesmo que ainda existam no banco)
- [x] Primeiro acesso → Boas-vindas (F048) continua igual
- [x] Cadastro free continua vendo Boas-vindas (F041)

## Fora de escopo

- Publicar o desafio de 7 dias (LP + post em Conquistas) — conteúdo
- Recusar login (F054)
- Mudar o vídeo (continua o mesmo ID)

O seed de aulas (F051) agora lista o tutorial como 1ª aula do M01.
Registros já no HML **não** mudam sozinhos (o seed não sobrescreve
`sortOrder`). Reordenar no admin se a Introdução ainda aparecer primeiro.
