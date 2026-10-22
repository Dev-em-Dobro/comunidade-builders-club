# F118 — Sheet do Presente no rodapé + lembrete pós-cadastro

## Status
Em implementação — 2026-10-22

Depende de: [F078](F078-popup-aula-presente.md) (pop-up da aula no Presente),
[F059](F059-presentes-publicos-atribuicao.md) (origem `bc_origem` + slug),
[F083](F083-presente-cadastro-primeira-aula.md) (cadastro cai na primeira aula).

## Contexto

Quem chega pelo link de Instagram (`/presentes/[slug]` ou
`/presentes/[slug]/[utmContent]`) encontra a modal da F078 **no centro** da
tela. O presente que a pessoa pediu fica atrás do convite para criar conta.
A conversão pede e-mail; o presente some de vista.

Esta feature muda só a forma e o pós-cadastro. A atribuição (cookie
`bc_origem`, `GiftVisit`, `origin_gift_slug`, `clickedOn` do funil
Bastidores) **não muda**.

## Decisões

### 1. A pop-up da F078 vira faixa/sheet no rodapé

Em desktop e mobile: `items-end`, sobe do footer (estilo Substack). Não usa
mais `sm:items-center`. Continua dismissible: Esc, X, clique no fundo,
"Agora não". Delay, público (só anônimo) e o `GiftSignupForm` interno
permanecem os da F078.

### 2. CTA "Ver meu presente" aponta para o próprio Presente

O destino é a rota pública que a página já é: `/presentes/[slug]`
(`giftPublicPath`). Na própria página, o botão fecha a sheet e rola até
`#presente` — não abre outra URL nem o `linkUrl` externo. Cadastro genérico
(`/cadastro`, slug `cadastro`) não tem este CTA.

### 3. Depois do cadastro novo, um lembrete uma vez

O cadastro do Presente continua caindo na aula (F078 / F083). Ao completar
**conta nova**, grava em `sessionStorage` o slug e o título do presente. No
app logado (e na página pública, se a sessão cair lá), uma modal pergunta
se a pessoa quer ir ao presente agora:

- primário: "Ver meu presente" → `/presentes/[slug]`
- secundário: "Depois" → fecha

`alreadyHadAccount` não grava e não mostra. Show-once: a primeira exibição
consome o pending e marca `shown`. Recarregar ou navegar não abre de novo.
Sem coluna nova no banco.

Safari privado / `sessionStorage` bloqueado: o lembrete não aparece, o
cadastro e a origem seguem iguais.

## O que muda

| Arquivo | Mudança |
|---|---|
| `src/lib/presentes/pos-cadastro.ts` | href, parse/encode, show-once |
| `src/lib/presentes/popup-aula.ts` | copy do CTA "Ver meu presente" |
| `src/app/presentes/presente-aula-popup.tsx` | sheet no rodapé + CTA |
| `src/components/gift-signup-form.tsx` | grava pending após conta nova |
| `src/components/presente-pos-cadastro-popup.tsx` | modal do lembrete |
| `src/components/app-shell-client.tsx` | monta o lembrete no app logado |
| `src/app/presentes/presente-publico.tsx` | âncora, props, lembrete se logado |

Sem migration. Sem env nova. Sem mudança em `GiftVisit`, `Membership` nem
`bastidoresCtaClick`.

## Fora de escopo

- Mudar o destino do cadastro (continua a aula)
- Pop-up no `/cadastro` genérico
- Persistir o lembrete no banco
- Teste A/B ou métrica de clique própria

## Critérios de aceitação

- [x] Spec antes do código
- [x] `giftPublicPath` e show-once cobertos por teste (sem Prisma)
- [ ] Sheet abre no rodapé em 1280px e 390px, não no centro
- [ ] "Ver meu presente" fecha a sheet e leva ao artigo do presente
- [ ] Sheet continua fechável (Esc, X, fundo, "Agora não")
- [ ] Conta nova vê o lembrete com o título quando houver
- [ ] Lembrete não reaparece no page load seguinte da mesma sessão
- [x] Origem / funil lives / métricas de Presentes intactos (código de
      `GiftVisit`, `bc_origem` e `clickedOn` não foi mexido)
- [x] Sem migration
