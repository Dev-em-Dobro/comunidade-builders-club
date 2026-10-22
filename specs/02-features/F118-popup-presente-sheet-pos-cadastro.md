# F118 — Pop-up do Presente (desktop centrado, mobile no rodapé) + lembrete pós-cadastro

## Status
Em implementação — 2026-10-22

Depende de: [F078](F078-popup-aula-presente.md) (pop-up da aula no Presente),
[F059](F059-presentes-publicos-atribuicao.md) (origem `bc_origem` + slug),
[F083](F083-presente-cadastro-primeira-aula.md) (cadastro cai na primeira aula).

## Contexto

Quem chega pelo link de Instagram (`/presentes/[slug]` ou
`/presentes/[slug]/[utmContent]`) encontra a modal da F078. No mobile a
caixa centrada cobria o artigo. Esta feature muda só a forma no
viewport estreito e o pós-cadastro. A atribuição (cookie `bc_origem`,
`GiftVisit`, `origin_gift_slug`, `clickedOn` do funil Bastidores)
**não muda**.

## Decisões

### 1. Desktop = a modal de antes da F118; mobile = a mesma caixa no rodapé

A partir de `md`: a pop-up volta a ser a modal **centrada** de
[F078](F078-popup-aula-presente.md) — mesmo tamanho, mesma caixa
(`max-w-lg`, `rounded-2xl`, `p-6` / `sm:p-7`, borda, sombra). Markup de
referência: `presente-aula-popup.tsx` **antes** do merge #133 (`2c083b8`).

Abaixo de `md`: **a mesma caixa** (não é sheet, não tem puxador) senta no
**rodapé**. Teto de ~`50dvh`; o conteúdo rola dentro. A metade de cima da
página continua visível (título do artigo). Continua dismissible: Esc, X,
clique no fundo, "Agora não". Delay, público (só anônimo) e o
`GiftSignupForm` interno permanecem os da F078.

### 2. A pop-up não tem CTA "Ver meu presente"

Quem abriu o link **já está** na página do presente. O CTA "Ver meu
presente" fica só no lembrete **pós-cadastro** (decisão 3).

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

### 4. Overlay/fundo iguais aos de antes da F118

`bg-black/60`, `backdrop-blur-sm`, `p-4`, `overflow-y-auto`. Só o
`z-index` sobe para `60` para a caixa ficar **acima** do aviso de cookies
(`z-50`) e continuar clicável no mobile. O componente do aviso **não
muda**. Sem `--bc-consent-h` na pop-up. Sem esconder o aviso.

### 5. Sem slide: fade de opacity na posição final

O primeiro frame já está no lugar (centro no `md+`, rodapé abaixo). Só
`opacity 0 → 1`. Sem `translateY`. `prefers-reduced-motion: reduce` corta
a animação.

### 6. X com área de toque ~44×44px

O fechar precisa ser fácil no mobile.

## O que muda

| Arquivo | Mudança |
|---|---|
| `src/lib/presentes/pos-cadastro.ts` | href, parse/encode, show-once |
| `src/lib/presentes/popup-aula.ts` | copy + classe do fade |
| `src/app/presentes/presente-aula-popup.tsx` | desktop centrado, mobile no rodapé |
| `src/app/globals.css` | fade de opacity |
| `src/components/gift-signup-form.tsx` | grava pending após conta nova |
| `src/components/presente-pos-cadastro-popup.tsx` | modal do lembrete |
| `src/components/app-shell-client.tsx` | monta o lembrete no app logado |
| `src/app/presentes/presente-publico.tsx` | props da pop-up, lembrete se logado |

Sem migration. Sem env nova. Sem mudança em `GiftVisit`, `Membership` nem
`bastidoresCtaClick`. Sem mudança em `cookie-consent.tsx`.

## Fora de escopo

- Mudar o destino do cadastro (continua a aula)
- Pop-up no `/cadastro` genérico
- Persistir o lembrete no banco
- Teste A/B ou métrica de clique própria
- Sheet / puxador / slide
- Esconder ou empurrar o aviso de cookies

## Critérios de aceitação

- [x] Spec antes do código
- [x] `giftPublicPath` e show-once cobertos por teste (sem Prisma)
- [ ] Em 1280px a pop-up é a modal centrada de antes da F118
- [ ] Em 390px a mesma caixa está no rodapé, ≤ ~50dvh, metade de cima
      do artigo visível; X e "Agora não" clicáveis
- [ ] Sem botão "Ver meu presente" na pop-up (o CTA fica no lembrete)
- [ ] Fade só de opacity; reduced-motion sem animação
- [ ] Overlay/fundo iguais aos de antes (#133), z acima do aviso
- [ ] Pop-up continua fechável (Esc, X, fundo, "Agora não")
- [ ] Conta nova vê o lembrete com o título quando houver
- [ ] Lembrete não reaparece no page load seguinte da mesma sessão
- [x] Origem / funil lives / métricas de Presentes intactos
- [x] Sem migration
- [x] `cookie-consent.tsx` intocado
