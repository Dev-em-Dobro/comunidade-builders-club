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
   (`d3b5019d-49b8-479e-a150-7ea654dc7cf6` · F058)
3. **Quick win no Lovable** — nova (depois do tutorial)
4. Bem-vindo e mapa da jornada
5. O que você vai construir e vender com IA

## Nova aula

| Campo | Valor |
|-------|--------|
| Módulo | `fase-1-m01-comece-por-aqui` |
| Slug | `desafio-quick-win-lovable` |
| Título | Quick win no Lovable |
| Panda `video_external_id` | `f32d7741-a581-4904-a8cf-e9fc4de2b018` |
| Library | `77c52f03-dc6` |
| Dashboard (não usar no embed) | `9191d82e-05c6-47ee-b42e-7dd52cfff993` |

Conteúdo: primeiro projeto do desafio de 7 dias (F055/F056) — landing
no Lovable para um estabelecimento da rede quente; postar no space
**Desafio Projetos**.

Aula **publicada** se o M01 já estiver publicado.

## Tutorial da comunidade

Substitui o vídeo antigo (`38608c40-…`) pelo mesmo embed da tela
Boas-vindas no plano **pago** (alunos de `/aulas` são pagantes).
Free continua vendo o vídeo free só em `/spaces/boas-vindas` (F058).

## Seed

`scripts/seed-aulas-panda.mts` — idempotente por slug. Neste módulo,
**atualiza `sortOrder`** (exceção à regra geral). HML por padrão;
produção com `--target=prod --confirm`.

## Critérios

- [x] M01 tem a aula Quick win no Lovable como 3ª, depois do tutorial
- [x] Player da aula usa `video_external_id`, não o UUID do dashboard
- [x] `/aulas/.../tutorial-intro-comunidade` usa o vídeo pago das Boas-vindas
- [x] HML e produção atualizados após confirmação

## Dependências

F011 · F051 · F055 · F056 · F058
