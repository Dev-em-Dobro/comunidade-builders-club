# F053 — Ofertas PRO e Elite (checkout Hubla)

## Status
Em implementação — 2026-08-23

## Contexto
O funil free (F041) já está em produção. Faltava a **oferta de liberação**:
dois planos pagos, com modal de comparação e webhook Hubla distinguindo
qual plano conceder.

O Club é a comunidade para quem quer montar a própria agência de IA.
Qualquer pessoa entra (cadastro) e lê a vitrine; interagir e abrir o resto
exige compra.

## Tiers

| Tier | Quem | No app |
|------|------|--------|
| `free` | Login sem compra (ou após cancelamento) | Feed, Boas-vindas, Geral. Sem interagir. |
| `pro` | Compra PRO (R$ 297) / allowlist / TMB Mentoria / `paid` legado | Comunidade + aulas + materiais + busca + interações |
| `elite` | Compra Elite (R$ 997) | Tudo do PRO + Orion além do Free (cortesia Pro no Orion) |
| `paid` | Legado F041 | Tratado como **PRO** (não remove acesso de quem já comprou) |

`Membership.status` continua `active` para free, pro e elite. Cancelamento
Hubla/TMB desce para `free` (admin não desce). Staff (`admin`/`instructor`)
tem acesso completo, inclusive Orion.

## Free (leitura)

- Menus: **Feed**, **Boas-vindas**, **Geral**
- Feed continua vitrine (F041): lê posts de spaces pagos; não abre a *página*
  do space nem interage
- **Avisos** deixa de ser free (era F041) — agora é comunidade (PRO+)
- Perfil e notificações seguem liberados (conta, não produto)
- Clique em menu/ação bloqueada → modal com CTA **Ver planos** → `/planos`

Identidade (sidebar e `/perfil`):

- Free: texto “Plano gratuito”, sem destaque
- PRO / Elite: badge (bandeirinha) com o nome do plano — Elite mais forte que PRO

## PRO — R$ 297

Checkout: [https://pay.hub.la/XaY8QNfZlOO1XBgjzMfY](https://pay.hub.la/XaY8QNfZlOO1XBgjzMfY)

Libera no Club:

- Comunidade (todos os spaces + publicar, comentar, reagir)
- Aulas gravadas
- Skills e templates (Materiais de apoio)
- Busca
- Ingresso pro evento (benefício da oferta; não é rota no MVP)
- **Orion no plano Free** (teto Free do app; [F058](F058-pro-orion-free.md))

**Promessa:** feche o 1º cliente em **90 dias**.

## Elite — R$ 997 (boleto R$ 1.297)

Cartão/Pix (Hubla): [https://pay.hub.la/v1SsMcVXNip7Mn5A2pNH](https://pay.hub.la/v1SsMcVXNip7Mn5A2pNH)

Boleto (TMB, R$ 1.297):

| Code | Papel |
|------|--------|
| `9DW254247E5` | Checkout de boleto na página `/planos` — [pay.tmb.com.br/DevemDobro/9DW254247E5](https://pay.tmb.com.br/DevemDobro/9DW254247E5) |
| `3XB272209KV` | Continua válido no webhook (concede Elite); não aparece como CTA |

- Tudo do PRO (inclui Orion Free)
- **Orion além do Free** — cortesia de plano Pro no Orion enquanto `trial-pro-*`
- 1 reunião semanal em grupo (benefício da oferta; não é rota no MVP)
- + Skills e + Templates (mesmo catálogo de materiais no MVP; mais conteúdo
  depois, sem gate extra agora)

**Promessa:** feche o 1º cliente em **90 dias**.

Membro **Free** que clica em Orion vai a `/planos` (motivo orion). PRO e Elite
abrem o app (`ORION_APP_URL`).

## Hubla

Envs:

| Env | Papel |
|-----|--------|
| `HUBLA_CHECKOUT_URL_PRO` | Override do checkout PRO |
| `HUBLA_CHECKOUT_URL_ELITE` | Override do checkout Elite |
| `HUBLA_PRODUCT_ID` | Legado — mapeia para **pro** |
| `HUBLA_PRODUCT_ID_PRO` | ID do produto PRO |
| `HUBLA_PRODUCT_ID_ELITE` | ID do produto Elite |

Webhook aceita qualquer ID do mapa. Sem nenhum ID → 503 (F021).
`member_added` do produto PRO → `tier=pro`; do Elite → `tier=elite`.
Grant nunca rebaixa (Elite + evento PRO permanece Elite).
`member_removed` / reembolso → `tier=free`.

TMB (F047): codes `9DW254247E5` e `3XB272209KV` concedem **elite**
(boleto Elite). Demais codes TMB (ex. Mentoria `1AS249898VN`) e allowlist
concedem **pro**.

## UI

Página **`/planos`** (liberada para free e PRO):

- Título “Ver planos”
- Subtítulo profissional (formação, comunidade, 1º cliente em 90 dias)
- Dois cards lado a lado (empilhados no mobile): PRO vs Elite
- Cards com destaque, hover (elevação/sombra) e lista de entregas em título + detalhe
- Elite em destaque (recomendado)
- CTA principal: checkout Hubla (cartão/Pix)
- Elite: **um** CTA de boleto TMB (`9DW254247E5`) com o label “Opção para boleto” (sem valor no botão)
- Sem rodapé de meios de pagamento
- Query `?motivo=` contextualiza o bloqueio (busca, aulas, space, …)
- Query `?destaque=elite` para quem já é PRO (upsell reunião e Orion Pro)
- Sem texto “oferta em definição”

Modal de bloqueio (clique em busca, aulas, space, publicar, …):

- Copy do motivo
- “Agora não” fecha
- CTA principal **Ver planos** → `/planos` (não checkout direto, não “Comprar Builders Club”)

Ações gated no servidor (aulas, busca, space pago, post de aula, …)
redirecionam para `/planos`. Links antigos `/?upgrade=1` também caem em `/planos`.

## Critérios

- [x] Spec antes do código
- [x] Enum `pro` / `elite`; `paid` legado = PRO
- [x] Free: só Feed, Boas-vindas, Geral (+ perfil/notificações)
- [x] Avisos e demais spaces exigem PRO
- [x] Página `/planos` compara as duas ofertas com os links oficiais
- [x] Sidebar e `/perfil` mostram badge PRO/Elite para quem fez upgrade
- [x] Modal de bloqueio leva a `/planos` (CTA Ver planos)
- [x] PRO vê Orion liberado (plano Free no app; F058)
- [x] Webhook mapeia product id → pro ou elite
- [ ] Preview only (migrate HML; prod só após merge + confirmação)
