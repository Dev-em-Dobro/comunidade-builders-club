# F126 — Aula avulsa (low ticket) via Hubla

## Status
Em implementação — 2026-11-16

## Objetivo

Vender um módulo do catálogo sozinho, por oferta de baixo valor na Hubla
(ex.: R$ 19), e entregar dentro do Club. Quem compra fica com a conta
**free** de sempre e ganha **só aquele módulo** liberado. O resto do
catálogo continua com cadeado, o que mostra o que o PRO abre.

Primeiro caso: produto Hubla **Site Animado do Zero com Claude**
(`vqojJ9ApO57mLqLA1LYT`) → módulo `criando-um-site-premium` (F116).

## Jornada

1. Compra na Hubla.
2. Webhook grava a compra **por e-mail** (a conta pode ainda não existir).
3. A pessoa entra no Club com o mesmo e-mail (código no e-mail, F059).
4. Em `/aulas`, o módulo comprado vem **primeiro**, liberado. Os outros
   módulos pagos seguem com cadeado.

## Modelo

| Campo | Onde | Papel |
|-------|------|-------|
| `hubla_product_id` | `module` (único, opcional) | qual produto Hubla vende este módulo |
| `module_purchase` | tabela nova | `email` + `module_id`, único por par |

Chave é o **e-mail normalizado**, não o usuário: a compra costuma chegar
antes do cadastro. Sem linha "pendente" para resolver depois.

A compra vale para o módulo **e descendentes** (mesma herança do
`freeAccess`, F065).

## Regras

- O produto do módulo **nunca** passa pelo fluxo do Club: não grava
  `allowed_email`, não muda `tier`, não converte para pago. Senão o
  cadastro com esse e-mail nasceria PRO (bootstrap F041).
- Produto que está no mapa do Club (`HUBLA_PRODUCT_ID*`) segue o fluxo
  atual, mesmo que algum módulo aponte para ele.
- Reembolso / remoção do membro (`invoice.refunded`,
  `customer.member_removed`) apaga a compra daquele módulo. **Não** desce
  `tier` nem mexe em allowlist (um PRO que reembolsa a aula avulsa continua
  PRO).
- Assinatura em status bloqueado (F014) não libera.
- Pago (PRO/Elite/staff) já assiste tudo; a compra é ignorada na leitura.
- Para quem tem compra, o módulo comprado conta como liberado em todos os
  gates que já usam `freeAccess`: catálogo, sidebar da aula, player,
  concluir aula.

## Configuração

Vincular produto ↔ módulo por script (HML por padrão; produção com
`--target=prod --confirm`):

```
npx tsx scripts/set-modulo-hubla.mts --modulo=criando-um-site-premium --produto=vqojJ9ApO57mLqLA1LYT
```

`--produto=` vazio remove o vínculo.

Na Hubla (manual): redirecionamento pós-compra para o Club e texto do
e-mail de compra dizendo para entrar com o mesmo e-mail.

## Fora do escopo

- Campo do produto Hubla no Admin (script por ora).
- E-mail próprio do Club avisando da compra.
- Atribuir upgrade free → pago à aula avulsa.

## Critérios

- [ ] Compra do produto vinculado libera o módulo para aquele e-mail, com ou sem conta
- [ ] Cadastro depois da compra nasce **free** com o módulo liberado
- [ ] Módulo comprado aparece primeiro em `/aulas`; os outros pagos com cadeado
- [ ] Aula do módulo comprado toca; aula de outro módulo pago redireciona
- [ ] Concluir aula funciona no módulo comprado
- [ ] Reembolso retira só o módulo; `tier` e allowlist intactos
- [ ] Produto do Club continua no fluxo atual
