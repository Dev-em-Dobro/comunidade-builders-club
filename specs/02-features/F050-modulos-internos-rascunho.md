# F050 — Módulos internos e rascunho de catálogo (n8n + IA Aplicada)

## Status
Em implementação

## Objetivo
Cadastrar a **Formação IA e Automações** (produto-base) **sem publicar**.
A seção de aulas será reformulada depois; até lá o aluno só vê o catálogo
já publicado.

## Hierarquia

```
Formação IA e Automações          ← produto-base (rascunho)
├── IA Aplicada                   ← módulo (criação de software)
│   ├── Introdução à formação…    ← submódulo
│   ├── Fundamentos de LLMs
│   ├── Engenharia de Prompt
│   ├── RAG
│   └── Projeto final
└── Automações com n8n            ← módulo (aulas na raiz da pasta)
```

## Modelo (extensão de F011)

- `Module.parentId` opcional — até **dois** níveis abaixo da raiz
  (formação → módulo → submódulo).
- `published = false` no módulo (e nas aulas) **não** aparece em `/aulas`
  nem na URL direta da aula. Toda a cadeia de ancestrais precisa estar
  publicada para o aluno ver a aula.

## Catálogo Panda (pasta `085efceb-2ec6-44c7-b93b-d0eae6f19cd0`)

Seed via `npm run db:seed:aulas-panda` (idempotente por slug). Padrão: HML.
Produção só com `--target=prod --confirm`.

## Critérios

- [x] `parentId` persiste; apagar o pai apaga os filhos
- [x] `/aulas` lista só módulos **publicados** e **de primeiro nível**
- [x] Aula de rascunho (ou ancestral rascunho) → 404 para o aluno
- [x] Admin mostra árvore compacta (formação → módulo → submódulo → aulas)
- [x] Formulários de criação **não** se repetem: um “Novo módulo” e um
      “Nova aula” (destino via select), recolhidos acima da árvore
- [x] Seed cria a formação + 2 módulos + 5 submódulos, todos `published: false`

## Dependências

F011 · ADR-005
