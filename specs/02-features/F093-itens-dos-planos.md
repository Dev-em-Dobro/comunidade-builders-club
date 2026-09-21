# F093 — Itens dos planos: uma linha, um resultado

## Status
Em implementação — 2026-09-19

Depende de: [F053](F053-ofertas-pro-elite.md) (ofertas PRO/Elite e checkouts),
[F090](F090-lista-garantia-ciente.md) (Lista da garantia).
Consome esta spec depois: [F094](F094-planos-v2.md) (página `/planos-v2`).

## Contexto

Os itens de cada plano em `/planos` eram **categorias de produto** — "Aulas
gravadas", "Skills", "Templates" — e nenhum deles tinha número. O formato era
título curto + parágrafo de apoio embaixo: 7 itens viravam 14 blocos de texto
num card, e a lista não era lida até o fim.

Benchmarks do mesmo público (Maker School / Nick Saraev e Comunidade Maestros
da IA) escrevem o oposto: uma linha por item, com a quantidade dentro da
própria frase ("218+ video lessons", "40+ copy-paste templates", "7 trilhas
com +20h de sistemas prontos").

Dois problemas concretos na página anterior:

1. O último item do PRO — *"7 dias para desistir (CDC) — sem garantia de
   resultado em 90 dias"* — era um aviso legal **negativo** renderizado com
   check verde, na posição de maior peso da lista.
2. O diferencial do Elite era *"Skills extras"* e *"Templates extras"*:
   "pague 3x mais e ganhe mais arquivos". O que de fato separa os planos é
   **acesso humano + garantia**, e isso estava enterrado no meio da lista.

O material existe e não estava sendo usado na copy. Inventário real do repo:
66 aulas em 18 módulos, 12 sites prontos por nicho, 27 scripts de venda,
5 prompts + prompt-mestre, contrato, briefing de 9 seções, tabela de
precificação, portfólio e o Orion.

## Decisões

### 1. `OfferHighlight` é uma linha só

```ts
type OfferHighlight = { texto: string; destaque?: boolean; novo?: boolean }
```

Era `{ title, detail }`. Cada linha carrega o benefício e a prova junto. Se a
linha precisa de explicação embaixo, ela está mal escrita.

`destaque` dá peso maior a um item (usado na garantia do Elite). Renderização
em `plan-cards.tsx`.

### 2. Item = resultado com número

Todo item é o que a pessoa consegue fazer, com a quantidade na frente quando
ela existe. O PRO caiu de 7 itens para 8 linhas curtas; o Elite, de 6 para 8.

### 3. O aviso do CDC sai da lista

Vira nota de rodapé sob os cards em `/planos`. A informação legal continua na
página — deixa de ser vendida como benefício.

### 4. Elite se diferencia por gente, não por volume de arquivo

"Skills extras" e "Templates extras" saem. Entram plantão semanal ao vivo,
Orion PRO nos 90 dias, mapa de execução semana a semana, revisão de proposta
e resposta em 24h úteis.

### 5. `checkout.ts` é a fonte única dos itens

A lista mora junto da oferta, não na página. Qualquer superfície que venda
plano lê daqui — não existe segunda cópia da copy para envelhecer.

### 6. Promessas novas são explícitas no código

Itens que a operação ainda **não** entrega carregam `novo: true`. A flag
`INCLUIR_PROMESSAS_NOVAS` desliga todos de uma vez, em todas as superfícies.

## Compromissos operacionais (confirmar antes de publicar)

| Item | Plano | O que passa a ser obrigação |
|------|-------|------------------------------|
| Revisão da proposta (1x) | Elite | Alguém revisa e devolve a proposta do membro |
| Resposta em 24h úteis | Elite | SLA de suporte enquanto a garantia corre |
| CMS incluso (só Elite) | Elite | Já no catálogo com gate ([F097](F097-cms-crm-elite-only.md)) |
| CRM e agente de WhatsApp inclusos | Elite | Entregar os "Em breve" sem cobrar à parte |
| Upgrade pagando a diferença | PRO→Elite | Regra de cobrança na Hubla (citada na nota do card PRO) |

Números citados na copy (66 aulas, 12 sites, 27 scripts) vieram da contagem
do repo em 19/09/2026. Mudou o catálogo, muda a linha.

## Fora do escopo

- Prova social e ancoragem de valor: nada de depoimento ou preço avulso sem
  dado validado. Selo do Elite diz "garantia de 90 dias" (verificável), não
  "o mais escolhido" (em setembro foram 3 PRO e nenhum Elite — F091).
- O card ainda abre por "Parcele em até", não pelo valor cheio.
- `PROMESSA_ELITE` (em `garantia.ts`) segue repetindo a garantia logo abaixo
  do item em destaque. Mexer nela afeta outras superfícies — fica para F094.

## Critérios de aceitação

- Card do PRO e do Elite renderizam uma linha por item, sem subtexto
- A garantia do Elite aparece em destaque (check sólido + texto em accent)
- O aviso do CDC aparece como rodapé em `/planos`, fora da lista
- `INCLUIR_PROMESSAS_NOVAS = false` remove os 3 itens `novo` do Elite
- Nenhum item passa de 130 caracteres; PRO não passa de 9 linhas (testes)
- Checkout PRO e Elite seguem apontando para as URLs de `checkout.ts`
- Elite segue exigindo o ciente da Lista da garantia (F090 intacta)
