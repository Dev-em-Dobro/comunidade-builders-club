# F119 — Faixa Black em Dobro Infinita no Presente (anônimo)

## Status
Em implementação — 2026-10-22

Depende de: [F059](F059-presentes-publicos-atribuicao.md) (página pública do
Presente), [F117](F117-banner-black-infinita.md) (mesma campanha, outro
lugar), [F078](F078-popup-aula-presente.md) / [F118](F118-popup-presente-sheet-pos-cadastro.md)
(pop-up do rodapé), [F057](F057-cookies-consentimento.md) (aviso de cookies).

## Contexto

O Presente (`/presentes/[slug]` e `/presentes/[slug]/[utmContent]`) é o
tráfego frio do Instagram. Quem chega **sem conta** ainda não viu a faixa
da Black no Club (F117 — só o app logado). Esta feature põe um aviso
discreto no topo da página pública, apontando para a oferta geral da Black.

Não substitui a F117. Não mexe na pop-up da aula nem no aviso de cookies.

## Decisões

### 1. Só visitante deslogado

A sessão é a mesma da página: `getOptionalUser()`. Com user, a faixa
**não monta**. Membro logado no Presente já tem (ou teve) a F117 no Club.

### 2. Copy, destino e dispensa

Copy **exata**:

> Inscrições abertas para a Black em Dobro Infinita. Desconto de 75% nas nossas formações, acesso vitalício às aulas e atualizações e bônus exclusivos.

O texto (a faixa inteira, menos o X) abre
`https://blackinfinita.devemdobro.com/oferta-geral?utm_source=builders-club&utm_medium=presente-faixa&utm_campaign=black-infinita`
em nova aba (`rel="noopener noreferrer"`). Desde 06/11/2026, as UTMs
identificam os acessos pela faixa, separados dos acessos pela pop-up (F121).

X fecha. Área de toque ≥ 44×44, `aria-label`. Dispensa em `localStorage`
na chave `bc_black_infinita_dismissed`. Fechou, **não volta** neste
navegador. Sem flash: o cliente só pinta depois de ler o storage. Storage
bloqueado (Safari privado): a faixa aparece; fechar vale só para aquela
visita.

### 3. Discreta, no fluxo, sem briga de z-index

Slim, cores do tema (`accent` / `border` / `muted`). Sem animação. No
**fluxo normal** do topo — não é `fixed`/`sticky`, não cobre o título do
artigo. Sem `z-index` próprio: a pop-up continua `z-[60]`, o aviso de
cookies `z-50`. Em 390px o texto pode quebrar em duas linhas; o X não
encolhe.

Não altera `cookie-consent.tsx` nem a pop-up da aula.

## O que muda

| Arquivo | Mudança |
|---|---|
| `src/lib/presentes/black-infinita-faixa.ts` | copy, href, chave, visibilidade |
| `src/app/presentes/presente-black-infinita-faixa.tsx` | faixa + X (client) |
| `src/app/presentes/presente-publico.tsx` | monta só se `!user` |

Sem migration. Sem env nova.

## Fora de escopo

- Faixa no Club logado (é F117)
- Esconder ou empurrar a pop-up / o aviso de cookies
- Persistência no banco

## Critérios de aceitação

- [x] Spec antes do código
- [x] Link abre `/oferta-geral` com UTMs `builders-club` / `presente-faixa` / `black-infinita`
- [ ] Deslogado vê a faixa no topo do Presente, copy exata, link em nova aba
- [ ] Logado não vê
- [ ] Fechar grava `bc_black_infinita_dismissed` e a faixa não volta no reload
- [ ] Sem flash da faixa para quem já dispensou
- [ ] Em 390px o texto cabe (pode quebrar em 2 linhas); em 1280px também
- [ ] Pop-up e aviso de cookies continuam utilizáveis; título do artigo visível
- [ ] Testes da visibilidade (deslogado mostra, logado esconde, dispensado esconde)
- [ ] Sem migration
