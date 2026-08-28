# F065 — Aulas da Fase 1 para o free

## Status
Em implementação — 2026-08-28

## Objetivo

O membro free vê a comunidade mas não aprende nada: lê resultado dos
outros e não produz o dele. Liberar um pedaço da formação para ele
entrar na plataforma, assistir e sentir o método. A conversa de pagar
acontece depois — não no cadeado da primeira tela.

O free **não comenta nas aulas** — só assiste.

## Quais aulas abrem

A Fase 1 ([F051](F051-jornada-fase-1-e-2.md)) é a raiz
`fase-1-do-zero-ao-primeiro-sim` com M01–M05:

```
FASE 1 — Do zero ao primeiro sim
├── M01 Comece por aqui          ← só este, no gratuito
├── M02 Escolha o nicho e o que vender
├── M03 Ache seus clientes
├── M04 Aborde e mande a amostra
└── M05 Feche seguro — o lado empresa
```

**Decisão (2026-08-28, Cadu):** só o primeiro submódulo,
`fase-1-m01-comece-por-aqui`. M02–M05, Fase 2 e o resto continuam
bloqueados. Abrir pouco e ir liberando depois é melhor do que abrir a
Fase 1 inteira e ter de fechar.

Catálogo **visível** por inteiro, com cadeado no que continua pago.
O card da Fase 1 não leva selo Pago: tem conteúdo free lá dentro.
Dentro da jornada, M01 sem cadeado; M02–M05 com cadeado.

## Modelo de acesso

Não existia flag de free/pago em aula. `Module` e `Lesson` só tinham
`published`. O gate era tudo-ou-nada (`requirePaidMemberOrRedirect`).

**Escolha: `Module.freeAccess Boolean @default(false)` + herança pela
árvore.** Marcar M01 propaga para as aulas daquele submódulo. Filho não
“desliga” o pai: quem tem `freeAccess` no ancestral libera o ramo.
Marcar a raiz Fase 1 abriria M01–M05 de uma vez — por isso a flag vai
no M01, não na raiz.

Pago / staff: qualquer aula `published`. Free: só se o módulo (ou um
ancestral) tem `freeAccess`.

A migration liga a flag em `fase-1-m01-comece-por-aqui` (e tira da
raiz, se a primeira tentativa F065 tinha marcado a Fase 1 inteira).
O admin mantém um checkbox para abrir outros ramos no futuro.

## Gates

### Aulas

`/aulas`, `/aulas/[module]`, `/aulas/[module]/[lesson]` exigem membro
`active` (não mais só pago). Sidebar: Aulas deixa de ser `LockedGhost`.
Orion, materiais e busca continuam cadeados.

Aula bloqueada: página abre **sem** iframe, com overlay + CTA
`/planos?motivo=aulas`. Marcar como concluída só vale em aula acessível
ao tier.

### Comentários

| Onde | Free |
|------|------|
| Threads de aula (`aula-threads`) | não — só assiste; pode ler a aba |
| Desafio Projetos (`projetos`) | sim — conversa da avaliação |
| Resto da comunidade | não (F041) |

Reações continuam PRO+ em todo lugar.

Servidor recusa comentário de free em `aula-threads` mesmo se a UI
falhar. UI: sem `CommentForm` / `ReplyToggle` nas aulas para free.

### Publicar

Gate **por space**, não mais só por tier. Precedente:
`ADMIN_ONLY_PUBLISH_SLUGS`.

`FREE_PUBLISH_SLUGS = [projetos]`.

Duplo: FAB (no space projetos, botão real; nos outros, modal de
upgrade) **e** `createPost` no servidor. Mexer só na UI não resolve.
Free edita/apaga o próprio post em `projetos`. `/nova` para free lista
só esse space.

## Métricas

`/admin/progresso` já lista membership `active` (inclui free) e o
`tier` já vem no include. Esta feature:

- expõe `tier` na linha (Gratuito / PRO / Elite)
- calcula o % sobre as aulas **a que aquele aluno tem acesso**. Free
  que fez o Comece por aqui não aparece com ~5% “desengajado”.
  Completions fora do escopo não entram no numerador.

## Boas-vindas

`STEPS_FREE`: o novo passo 2 aponta para `/aulas` (agora liberada).
Quatro passos; nenhum href para rota ainda cadeada.

1. Completar o perfil → `/perfil`
2. Assistir as primeiras aulas → `/aulas`
3. Ver o que a comunidade está fechando → `/spaces/conquistas`
4. Pegar os outros presentes → `/spaces/presentes`

## Ops (fora do código)

Quem responde as avaliações no Desafio Projetos e em quanto tempo —
combinar com o time. Não prometer SLA na UI até isso existir.
Prometer avaliação e não entregar é pior que não prometer.

## Fora de escopo

- M02–M05, Fase 2, materiais, busca, Orion
- Comentários/reações na comunidade em geral
- Migration de produção (só após preview + confirmação)

## Critérios

- [x] Spec antes do código
- [x] `Module.freeAccess` + herança; M01 Comece por aqui marcado na migration
- [x] Free abre `/aulas` e assiste o M01; M02–M05 e Fase 2 cadeado, sem player
- [x] Free não comenta em aula (UI + server); pode comentar em `projetos`
- [x] Free publica só em `projetos` (FAB + `/nova` + `createPost`)
- [x] Progresso: coluna de tier; % do free sobre aulas acessíveis
- [x] `STEPS_FREE` inclui aulas como passo 2, sem link bloqueado
- [ ] Preview / HML; produção só com confirmação
