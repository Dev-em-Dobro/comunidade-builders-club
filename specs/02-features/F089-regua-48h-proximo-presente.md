# F089 — E-mail 48h entrega o próximo presente (não cobra presença)

## Status
Implementada — 2026-09-17

Depende de: [F075](F075-regua-email-48h.md) (gatilho `sem_acesso_48h`),
[F059](F059-presentes-publicos-atribuicao.md) (`Membership.originGiftSlug`).

## Contexto

O cano da régua 48h já dispara (206 envios; ~180 Free). Baseline: **5%**
voltaram a logar. O texto atual cobra presença de quem ainda não recebeu
nada da casa — hipótese: entregar o **próximo material da trilha de Presentes**
(personalizado pelo presente de origem) move mais gente.

Meta: de 5% para **12%** de login pós-e-mail em duas semanas (veredito ~19/09
no Dobro OS / Crescimento).

## O que muda (só o texto + o link do CTA)

| Mantém | Muda |
|--------|------|
| Gatilho `sem_acesso_48h` | Assunto e corpo |
| Horário / cron / elegibilidade | CTA aponta para um Presente (ou o space) |
| Um e-mail por episódio | Personalização por `originGiftSlug` |
| Público (member active) | — |
| 7d / 14d (F084) intocados | — |

**Não** ligar nem desligar 7d/14d nesta feature. **Não** criar posts novos —
usa o acervo do space `presentes`.

## Três textos (variantes)

1. **Com origem + próximo:** menciona o presente que a pessoa pegou e entrega
   o próximo (outro slug do space, mesma ordem do feed: `pinnedAt`, depois
   `createdAt`).
2. **Sem origem:** entrega o primeiro Presente da lista (cadastro sem cookie).
3. **Sem material no banco:** fallback suave para `/spaces/presentes` (não
   volta ao tom de "sentimos sua falta").

Link preferencial: `/presentes/<slug>` (leitura pública, F059).

## Critérios

1. Subject/body deixam de cobrar ausência
2. Com `originGiftSlug`, o CTA é outro Presente (≠ origem) quando existir
3. Sem origem, ainda entrega um Presente (ou o space)
4. Regras de disparo F075 inalteradas; F084 inalterada
5. Testes unitários das variantes de copy e da escolha do próximo

## O que muda no código

| Arquivo | Mudança |
|---------|---------|
| `specs/02-features/F089-regua-48h-proximo-presente.md` | esta spec |
| `src/lib/regua/material-48h.ts` | escolher próximo + montar as 3 copies |
| `src/lib/regua/material-48h.test.ts` | testes |
| `src/lib/email/index.ts` | `sendRegua48hEmail` recebe o material |
| `src/lib/regua/disparo.ts` | carrega `originGiftSlug` + lista de Presentes |

## Fora de escopo

- Opt-out / `notifyReguaEmail`
- Novos gatilhos ou mudança de horário
- Conteúdo editorial novo no space
- Merge em `main` sem pedido explícito
