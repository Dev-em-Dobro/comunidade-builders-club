# F122 — Aceite do Contrato de Conteúdos Digitais (DevQuest + Builders)

## Status
Em implementação — 2026-10-28

## Contexto
A partir de **28/10/2026** a Dev em Dobro vende **DevQuest e Builders Club
juntos**. O PDF
`docs/contrato-conteudos-digitais-dev-em-dobro.pdf` (servido em
`/legal/contrato-conteudos-digitais-dev-em-dobro.pdf`) precisa de aceite
demonstrável no app, no mesmo espírito da F090 (garantia) e F115 (termos Elite).

Quem comprou **antes** dessa data não vê o modal. Free e staff sem compra paga
também não.

## Decisões
- Documento `contrato-conteudos` em `legal_acceptance` (append-only), versão
  `2026-10-28`. Mudança material no PDF → nova versão + novo aceite.
- Modal bloqueante no layout `(app)` (padrão F115): sem shell até aceitar.
  Checkbox desmarcado; botão só após marcar; grava IP/UA via F058.
- **Quem precisa aceitar:** membership `active` com compra paga — `tier` ∈
  `pro` | `elite` | `paid` **ou** `vitalicio=true` (F120 Black Infinita) —
  **e** data efetiva de compra ≥ `2026-10-28T00:00:00-03:00`
  (America/São_Paulo), **e** sem aceite da versão vigente.
- **Data efetiva:** a **mais recente** entre
  1. `Membership.convertedToPaidAt`
  2. `AllowedEmail.paidAt` do e-mail da conta
  3. `Membership.vitalicioGrantedAt` (F120 — upgrade PRO→Vitalício depois do
     corte ainda precisa do contrato; Vitalício antigo antes do corte não)
  Sem nenhuma data confiável → **não** pedir (não inventar).
- Admin/instructor **sem** tier pago / vitalício não entram no gate só pelo
  papel (evita bloquear bootstrap admin free).
- Ordem no layout quando vários gates: Termos Elite (F115) → Contrato (F122) →
  ciente garantia (F090, overlay no shell).
- PDF fica em `public/legal/` para download autenticado na prática via link
  absoluto do app; a cópia em `docs/` é a fonte versionada no repositório.

## Critérios
- [x] Spec antes do código
- [x] Comprador pago com `paid_at`/`convertedToPaidAt` ≥ 28/10/2026 sem aceite
      vê o modal e não usa o app até aceitar
- [x] Comprador com data anterior a 28/10/2026 não vê o modal
- [x] Free / sem data de compra não vê o modal
- [x] Aceite grava `legal_acceptance` (documento, versão, userId, IP, UA)
- [x] Link abre o PDF; checkbox + botão “Aceitar e continuar”
- [x] Testes unitários do predicado de corte / necessidade de aceite
- [ ] Verificado em HML com conta paga de teste (compra ≥ 28/10)
