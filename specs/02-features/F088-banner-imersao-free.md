# F088 — Banner da Imersão na comunidade (só Free)

## Status
Implementada — 2026-09-17

Depende de: [F077](F077-cta-imersao-no-presente.md) (copy, prazo e
`imersaoHref` em `src/lib/eventos/imersao-ia.ts`).

## Contexto

Há ~296 contas Free ativas na comunidade (muitas vindas de Presente) e nenhuma
é convidada para a Imersão **por dentro do produto**. A oferta mais forte da
casa (22 e 23/09/2026) só chega a essa base pelo Instagram.

O banner precisa estar no ar até **18/09** (quatro dias antes da 1ª noite) e
sair sozinho em **24/09** (já coberto por `imersaoAtiva` / `terminaEm`).

Métrica de sucesso: inscrições na landing com origem **`club-banner`** no link
(meta: ≥ 10 das ~296 Free). Sem origem no link, não há veredito.

## Decisões

### 1. Componente com gate de tier, não post fixado

Post fixado (`pinnedAt`) seria visível para PRO/Elite também. A brief proíbe
isso: pagante vendo chamada de evento pago é ruído (e Elite pode achar que é
entrega do plano).

Reusa a mesma noção de “pago” do shell (`isPaid` / `isPaidMembership`): Free
vê; PRO, Elite, `paid` legado e staff (admin/instructor) **não** veem.

### 2. Faixa no app shell, não só no feed

Colocada no mesmo slot estrutural da live Elite (F079), no topo da coluna
principal: cobre feed, spaces, aulas e demais rotas `(app)/` sem duplicar.

### 3. Origem no link: `utm_medium=club-banner`

Mesma landing da F077 (`imersao-ia.devemdobro.com/v1`), com:

- `utm_source=builders-club`
- `utm_medium=club-banner` (distingue do Presente, que usa `presente`)
- `utm_campaign=imersao-ia`

O Presente continua com `utm_medium=presente`. Um parâmetro opcional em
`imersaoHref` escolhe o medium sem duplicar a copy.

### 4. Copy e prazo vêm da F077

Não reescrever texto nem data: `IMERSAO_IA` + `imersaoAtiva()`. Passou de
24/09, o banner some sozinho — sem lembrete de remover código.

### 5. Sem sistema de banners

Um evento, uma semana, um componente. Sem tabela, agendamento, histórico nem
CMS de promoções.

## Critérios de aceitação

1. Membro Free ativo vê a faixa no app (qualquer rota autenticada do shell)
2. PRO, Elite, `paid` e staff **não** veem a faixa
3. CTA abre a landing com `utm_medium=club-banner` (e source/campaign do Club)
4. Depois de `2026-09-24T00:00:00-03:00`, a faixa não renderiza
5. Sem migration; Presente (F077) permanece inalterado na copy/prazo

## O que muda

| Arquivo | Mudança |
|---------|---------|
| `specs/02-features/F088-banner-imersao-free.md` | esta spec |
| `src/lib/eventos/imersao-ia.ts` | `imersaoHref` aceita medium (`presente` \| `club-banner`) |
| `src/lib/eventos/imersao-ia.test.ts` | cobre o medium do Club |
| `src/components/club-imersao-banner.tsx` | faixa Free-only |
| `src/components/app-shell-client.tsx` | render `{!isPaid && <ClubImersaoBanner />}` |

## Fora de escopo

- Mostrar para pagante
- Post fixado como atalho
- Banner genérico / agendável
- Contador regressivo (fica na landing)
- Merge em `main` sem pedido explícito (fluxo: feature → preview)

## Relacionados

- F077 — CTA imersão no Presente
- F069 — faixa de upgrade Free (outro produto: o Club)
- F079 — live banner Elite (mesmo slot no shell)
