# F090 — Lista da garantia publicada + ciente (Elite)

## Status
Implementada — 2026-09-17

Fonte operacional: Dobro OS `bc-regua-garantia` (régua Elite).
Depende de: [F058](F058-registro-aceite-legal.md) (`legal_acceptance`),
[F053](F053-ofertas-pro-elite.md) (ofertas).

## Contexto

Com o re-tier de `paid` → Elite, a garantia de 90 dias alcança **42**
pessoas. O processo `bc-regua-garantia` já define a lista; sem **publicação
+ ciente antes/no primeiro acesso**, nada é exigível — pedido vira
devolução porque a condição nunca foi apresentada.

A máquina `legal_acceptance` já existe (112 aceites de termos/privacidade).
Falta o **documento** `garantia` e o fluxo de ciente.

## Duas garantias (não confundir)

| | 7 dias (CDC) | 90 dias (régua Elite) |
|---|---|---|
| Quem | Pro e Elite | **só Elite** |
| Tipo | Incondicional (lei) | Condicionada à lista de execução |
| Onde | Direito do consumidor | `/garantia` + ciente |

O Pro **não** tem garantia de resultado em 90 dias. Material que sugerir
isso precisa ser corrigido nesta feature.

## Decisões

1. Página pública `/garantia` com a lista versionada (`VERSAO_GARANTIA`).
2. Documento `garantia` em `legal_acceptance` (append-only), separado de
   `VERSAO_LEGAL` (termos/privacidade).
3. **Elite logado sem ciente da versão vigente:** modal bloqueante no app
   até marcar “Estou ciente”.
4. **`/planos` card Elite:** checkbox + registro do ciente (se logado)
   antes de liberar os links de checkout.
5. Promessa do card **Pro** deixa de espelhar a do Elite; Elite ganha
   destaque explícito da garantia condicionada + link.

## Critérios

1. `/garantia` pública, com versão e os 8 itens da régua
2. Aceite grava `documento=garantia`, versão, data, IP, UA
3. Elite sem ciente não usa o app até aceitar
4. Checkout Elite no `/planos` exige ciente quando o usuário está logado
5. Card Pro não promete garantia de 90 dias / resultado
6. Sem migration (usa tabela existente)

## Fora de escopo

- Formulário de pedido de reembolso / conferência CS
- E-mail de boas-vindas Elite (pode vir depois)
- Retroagir exigibilidade à Turma 1 (processo: oferta antiga)
- Validação jurídica externa (continua no OS §10; publicamos o texto do processo)

## Relacionados

- Dobro OS: `docs/processos/bc-regua-garantia.md`
- F053 ofertas · F058 aceite legal · F063 `/planos` público
