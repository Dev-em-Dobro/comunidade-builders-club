# F056 — Nomes e descrições: Conquistas, Freela, Projetos

## Status
Implementado — 2026-08-24

## Objetivo
Os três spaces de “mostrar trabalho” passam a dizer **o que postar**, não
um rótulo genérico. Slugs **não mudam** (`conquistas`, `freelas`,
`projetos`) — só o nome no menu e a descrição no topo da página.

## Mudanças

| Slug | Nome | Descrição |
|------|------|-----------|
| `conquistas` | Conquistas | Poste suas conquistas aqui, cliente fechado, proposta aceita, ou primeiro pagamento. Conte como foi o processo pra fechar a venda, isso ajuda a comunidade a crescer |
| `freelas` | Indicação Freela | Se tiver um freela pra indicar pra um colega, poste aqui |
| `projetos` | Desafio Projetos | Mostre o que está construindo *(nome novo; descrição anterior, o pedido não trocou o texto)* |

## Menções em posts

Busca em HML e produção (posts cujo body cita Freelas/Projetos):

- Aviso fixado do Pablo (`builders-club://avisos/como-usar-v1`) — **atualiza**
  no seed `seed-aviso-boas-vindas.mts`.
- Cards de Boas-vindas “Como usar a plataforma” e “Para que serve cada
  Space” (produção, autor Pablo) — **saem** com a F055 (mural removido).
  Não reescrever se o seed F055 já apagou.
- Post de membro em Dúvidas citando “nos projetos” — **não tocar**
  (não é Boas-vindas nem post da equipe).

## Critérios

- [x] Menu/título de `/spaces/conquistas` com a descrição nova
- [x] Menu de Freelas vira **Indicação Freela** + descrição de indicação
- [x] Menu de Projetos vira **Desafio Projetos**
- [x] URLs `/spaces/freelas` e `/spaces/projetos` seguem iguais
- [x] Aviso “Como usar” do Pablo usa os nomes novos

## Aplicar em HML/prod

```
npm run db:seed:envs -- --target=hml
npx tsx scripts/seed-aviso-boas-vindas.mts --target=hml
```

Produção: mesmos comandos com `--target=prod` (e `--confirm` no aviso).
Cache da sidebar de spaces: até 2 min (`listSpaces`, tag `spaces`).
