# F081 — Valor e plano da compra no membership (Hubla)

## Status
Implementada — 2026-09-08

## Objetivo
Saber quanto o Club fatura **sem abrir a Hubla**. O webhook já decide
acesso; passa a guardar o payload bruto e gravar valor / plano / moeda /
data da última cobrança no `membership` do aluno.

## Por quê
`hubla_webhook_delivery` só tinha idempotência (`idempotency_key`,
`event_type`, `processed_at`) — zero centavos. `membership.tier` diz
acesso, não preço. Pagantes parados não davam para monetizar na reunião
de CS. Decisão: persistir o que o webhook já manda; **não** chamar API
Hubla; **não** inventar preço para legado `paid`.

## O que muda

### 1. Payload bruto em `hubla_webhook_delivery`
Coluna `payload jsonb` (nullable). Todo evento processado (concedeu,
revogou ou ignorou) grava o JSON completo quando há
`x-hubla-idempotency`. Serve para achar o nome real do campo de valor e
para não perder cancelamentos (`customer.member_removed`).

### 2. Extração em `interpretarEventoHubla`
Além de `plan: pro|elite`, extrai cobrança (`valorCentavos`, `moeda`,
`cobradoEm`) via `extrairCobrancaHubla`. Caminhos candidatos tipados em
`tipos.ts` (invoice / subscription / payment). **Valor ausente → null**;
nunca bloqueia acesso.

### 3. Colunas em `membership`
| Coluna | Tipo | Nota |
|--------|------|------|
| `valor_centavos` | `Int?` | Inteiro; nunca float |
| `plano_pago` | `String?` | `pro` \| `elite` na última compra Hubla |
| `moeda` | `String?` | Ex.: `BRL` |
| `ultima_cobranca_em` | `DateTime?` | Data da cobrança (payload ou `now`) |

Legado (43 `paid` / pro-elite manuais): ficam **nulos** de propósito.
Ricardo preenche à mão os 8 `pro`/`elite` atuais se quiser.

### 4. Fluxo de conceder / revogar
- **Conceder:** allowlist + tier como hoje; se há `User`, upsert também
  `valorCentavos` / `planoPago` / `moeda` / `ultimaCobrancaEm` (nulos ok).
- **Revogar** (`member_removed` / `invoice.refunded`): payload gravado;
  membership → `free` (soma de faturamento exclui). Campos de dinheiro
  **não** são apagados (histórico da última compra conhecida).

## Fora de escopo
- Tela / card de admin
- Backfill de preço nos pagantes legados
- API Hubla / polling
- Card “comprou e não entrou”

## Critérios de aceite
- [x] Compra nova com valor no payload → `membership` com valor, plano e data
- [x] `select sum(valor_centavos) from membership where tier <> 'free'` responde sem Hubla
- [x] `customer.member_removed` fica em `hubla_webhook_delivery` com `payload`
- [x] Payload sem valor → acesso concedido; colunas de dinheiro nulas
- [x] Dinheiro faltando **nunca** devolve 4xx/5xx por causa do parse de valor

## Relacionadas
F014 (webhook), F041 (freemium / downgrade free), F053 (ofertas PRO/Elite).
