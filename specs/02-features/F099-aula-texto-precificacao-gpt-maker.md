# F099 — Aula em texto: como cobrar por agentes (GPT Maker)

## Status
Em implementação — 2026-09-21

Depende de: [F098](F098-fundamentos-gpt-maker.md).

## Contexto

O submódulo Fundamentos GPT Maker tinha só os 4 vídeos (conta, agente,
WhatsApp, Agenda). Quem termina a trilha monta o agente e não lê, no
mesmo bloco, quanto cobrar pela operação.

A referência da casa: **R$ 150 de recorrência** — porque o builder
acompanha as mensagens do bot e faz melhoria ao longo do tempo. Com o
tempo, um plano maior do GPT Maker cabe todos os clientes.

## Decisão

1. Quinta aula no `fundamentos-gpt-maker`, **sem vídeo** (mesmo padrão
   da Lista de templates): o player mostra que o conteúdo está na
   descrição.
2. Slug `como-cobrar-por-agentes`, sortOrder 4 (depois da Agenda).
3. Texto no seed + `aulas-descricoes-data.mts`. Link interno
   `/entregaveis/precificacao` — não o domínio de produção.
4. Seed idempotente. Publica com o módulo (HML/preview).
5. Free que abre rota de aula **fora** do M01 é redirecionado para
   `AULAS_FREE_HREF` (Comece por aqui). A descrição de aula paga não
   chega a renderizar — em aula de texto ela **é** o conteúdo.

## Critérios

- [x] Spec antes do código
- [ ] Sidebar do GPT Maker lista a 5ª aula
- [ ] Sem `pandaVideoExternalId`
- [ ] Descrição fala de R$ 150 recorrente, acompanhamento e plano único
- [ ] Link para `/entregaveis/precificacao`
- [x] Overlay do player não pede "baixar arquivo" em aula sem vídeo
- [x] Free em rota de aula paga vai para o Comece por aqui (`AULAS_FREE_HREF`)

## Fora de escopo

- Mudar a aula de Precificação da raiz de Fundamentos (vídeo)
- Precificar a ferramenta GPT Maker em si (tabela de planos deles)
