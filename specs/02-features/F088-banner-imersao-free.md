# F088 — Banner da Imersão na comunidade (todos menos Elite)

## Status
Implementada — 2026-09-17
Revisada — 2026-09-24 (prazo e gate de tier; ver decisões 1 e 4)

Depende de: [F077](F077-cta-imersao-no-presente.md) (copy, prazo e
`imersaoHref` em `src/lib/eventos/imersao-ia.ts`).

## Contexto

Há ~296 contas Free ativas na comunidade (muitas vindas de Presente) e nenhuma
é convidada para a Imersão **por dentro do produto**. A oferta mais forte da
casa (22 e 23/09/2026) só chega a essa base pelo Instagram.

O banner precisa estar no ar até **18/09** (quatro dias antes da 1ª noite) e
sair sozinho **1h antes da 1ª noite**, 22/09 18h30 (já coberto por
`imersaoAtiva` / `imersaoFechaEm`).

Métrica de sucesso: inscrições na landing com origem **`club-banner`** no link
(meta: ≥ 10 das ~296 Free). Sem origem no link, não há veredito.

## Decisões

### 1. Componente com gate de tier, não post fixado

Post fixado (`pinnedAt`) seria visível para todo mundo, sem gate. O gate existe
porque Elite não pode ver: a imersão **vende Elite**, e convidar quem já é
assinante é vender o que a pessoa já tem — pior, pode passar por entrega do
plano.

**Correção de 24/09/2026:** o gate era `!isPaid`, o que escondia a faixa de PRO
junto com Elite. PRO é público da imersão: é lá que o upgrade para Elite é
vendido, e PRO pagar ingresso e participar é o caminho desejado. O gate agora é
`!isElite` (`isEliteMembership`).

Quem vê: Free, `paid` legado e PRO. Quem não vê: Elite e staff
(admin/instructor — `isEliteMembership` devolve `true` para eles).

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

Não reescrever texto nem data: `IMERSAO_IA` + `imersaoAtiva()`. Uma hora antes
da 1ª noite, o banner some sozinho — sem lembrete de remover código. A regra
mudou em 24/09/2026 (antes era meia-noite depois da 2ª noite); a decisão e o
porquê estão na F077.

### 5. Sem sistema de banners

Um evento, uma semana, um componente. Sem tabela, agendamento, histórico nem
CMS de promoções.

## Critérios de aceitação

1. Membro Free, `paid` ou PRO ativo vê a faixa no app (qualquer rota autenticada do shell)
2. Elite e staff (admin/instructor) **não** veem a faixa
3. CTA abre a landing com `utm_medium=club-banner` (e source/campaign do Club)
4. A partir de `2026-09-22T18:30:00-03:00` (1h antes da 1ª noite), a faixa não renderiza
5. Sem migration; Presente (F077) permanece inalterado na copy/prazo

## O que muda

| Arquivo | Mudança |
|---------|---------|
| `specs/02-features/F088-banner-imersao-free.md` | esta spec |
| `src/lib/eventos/imersao-ia.ts` | `imersaoHref` aceita medium (`presente` \| `club-banner`) |
| `src/lib/eventos/imersao-ia.test.ts` | cobre o medium do Club |
| `src/components/club-imersao-banner.tsx` | a faixa |
| `src/components/app-shell-client.tsx` | render `{!isElite && <ClubImersaoBanner />}` |

## Fora de escopo

- Mostrar para Elite
- Post fixado como atalho
- Banner genérico / agendável
- Contador regressivo (fica na landing)
- Merge em `main` sem pedido explícito (fluxo: feature → preview)

## Relacionados

- F077 — CTA imersão no Presente
- F069 — faixa de upgrade Free (outro produto: o Club)
- F079 — live banner Elite (mesmo slot no shell)
