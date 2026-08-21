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
└── Automações com n8n            ← módulo
    ├── Introdução ao n8n         ← submódulo
    ├── Banco de integrações n8n
    ├── Fundamentos n8n
    ├── Criação de agentes
    └── Criando automações com IA
```

## Modelo (extensão de F011)

- `Module.parentId` opcional — até **dois** níveis abaixo da raiz
  (formação → módulo → submódulo).
- `published = false` no módulo (e nas aulas) **não** aparece em `/aulas`
  nem na URL direta da aula. Toda a cadeia de ancestrais precisa estar
  publicada para o aluno ver a aula.
- Títulos das aulas na UI são **amigáveis**, sem prefixo `Aula N —`
  (a ordem fica no `sortOrder` e na sidebar).

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
- [x] Seed cria a formação + 2 módulos + 10 submódulos (5 de IA + 5 de n8n), todos `published: false`
- [x] Títulos das aulas de IA/n8n sem numeração `Aula N —`

## Dependências

F011 · ADR-005
