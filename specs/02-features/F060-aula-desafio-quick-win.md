# F060 — Aula do desafio (quick win) + tutorial da comunidade atualizado

## Status
Em implementação

## Objetivo
Cadastrar a aula do **desafio quick win** no M01 Comece por aqui e
alinhar o tutorial **Como usar a comunidade** ao vídeo pago das
Boas-vindas (F058).

## M01 — Comece por aqui (ordem)

A ordem no catálogo (e no seed, com `forceLessonSort` neste módulo):

1. Introdução ao Builders Club
2. Como usar a comunidade — vídeo **pago** das Boas-vindas
   (`c8ec857d-4d78-4516-921a-2fee9c35b590` · F058, regravado em 31/08/2026;
   o anterior era `d3b5019d-49b8-479e-a150-7ea654dc7cf6`)
3. **Desafio primeiro projeto em 7 dias com Lovable** — nova (depois do tutorial)
4. Bem-vindo e mapa da jornada
5. O que você vai construir e vender com IA

## Nova aula

| Campo | Valor |
|-------|--------|
| Módulo | `fase-1-m01-comece-por-aqui` |
| Slug | `desafio-quick-win-lovable` |
| Título | Desafio primeiro projeto em 7 dias com Lovable |
| Panda `video_external_id` | `f32d7741-a581-4904-a8cf-e9fc4de2b018` |
| Library | `77c52f03-dc6` |
| Dashboard (não usar no embed) | `9191d82e-05c6-47ee-b42e-7dd52cfff993` |

Conteúdo: primeiro projeto do desafio de 7 dias (F055/F056) — landing
no Lovable para um estabelecimento da rede quente; postar no space
**Desafio Projetos**.

Aula **publicada** se o M01 já estiver publicado.

## Tutorial da comunidade

Substitui o vídeo antigo (`38608c40-…`) pelo mesmo embed da tela
Boas-vindas no plano **pago**. Free continua vendo o vídeo free em
`/spaces/boas-vindas` (F058).

### Descrição da aula (31/08/2026)

Quando esta seção foi escrita, valia que "alunos de `/aulas` são
pagantes". A [F065](F065-aulas-fase-1-free.md) abriu o M01 para o
gratuito, e a premissa caiu: **o free abre esta aula e assiste ao tour do
Club inteiro**, com funcionalidade que o plano dele não tem. Sem aviso, a
pessoa sai procurando no menu o que viu no vídeo.

A descrição resolve dizendo de qual plano é a plataforma do tour, pelo
ganho e não pela tranca ([F067](F067-copy-do-ganho-free.md)):

> Tour completo da plataforma: o Feed, os Spaces, as Aulas e como circular
> na comunidade. É o tutorial do Club completo — tudo o que aparece aqui
> está aberto nos planos PRO e Elite.

Vive no banco. Aplicar por ambiente com
`scripts/fix-video-tutorial-f058.mts`, que também troca o vídeo e avalia
os dois campos em separado.

## Seed

`scripts/seed-aulas-panda.mts` — idempotente por slug. Neste módulo,
**atualiza `sortOrder`** (exceção à regra geral). HML por padrão;
produção com `--target=prod --confirm`.

## Critérios

- [x] M01 tem a aula do desafio como 3ª, depois do tutorial

> **Renomeada em 27/08/2026.** "Quick win no Lovable" →
> **"Desafio primeiro projeto em 7 dias com Lovable"**. O título antigo não
> dizia o que a aula é: "quick win" é jargão interno, e a aula é a porta do
> desafio de 7 dias. O **slug não mudou** (`desafio-quick-win-lovable`), então a
> URL da aula continua a mesma.
- [x] Player da aula usa `video_external_id`, não o UUID do dashboard
- [x] `/aulas/.../tutorial-intro-comunidade` usa o vídeo pago das Boas-vindas
- [x] HML e produção atualizados após confirmação

## Dependências

F011 · F051 · F055 · F056 · F058
