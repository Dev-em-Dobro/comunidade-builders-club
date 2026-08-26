# F058 — Registro de aceite dos Termos e da Política

## Status
Em desenvolvimento — 2026-08-24

## Contexto
O login já mostra "Ao continuar, você concorda com os Termos de Uso e a
Política de Privacidade" (F020), mas **nada é gravado**. Com cadastro público
do freemium (F041), não há como demonstrar quem aceitou o quê, nem quando.

## Comportamento

### Aceite implícito, registro explícito
A frase no login continua — sem checkbox, sem fricção na entrada. O que muda é
que o servidor passa a registrar o aceite.

### Versão
`src/lib/legal.ts` ganha `VERSAO_LEGAL`, derivada da data de atualização dos
documentos. O texto legal mora no código, então o histórico do git prova o que
cada versão dizia — a evidência fica completa sem guardar cópia do texto.

### Onde grava
Tabela append-only `legal_acceptance`: uma linha por documento por versão
aceita, com data, IP e user-agent. Nada é sobrescrito — trocar a versão da
Política não apaga a prova da anterior.

### Custo no hot path
`ensureMemberBootstrap()` roda a cada login e hoje é **1 query** no caminho
quente (membro ativo com profile). Consultar `legal_acceptance` a cada request
quebraria isso.

Solução: `Membership.termosVersao` guarda a última versão aceita e já vem na
query que existe. A comparação sai de graça; a tabela de histórico só é tocada
quando a versão difere. O campo é cache; a tabela é a fonte da verdade.

### Versão nova
Quando `VERSAO_LEGAL` muda, o próximo login de cada membro grava uma linha
nova. Nenhum aviso na tela nesta feature — a frase do login cobre o aceite
implícito e a nova linha registra sob qual versão a pessoa entrou.

## Não faz parte
- Checkbox obrigatório / tela de aceite (decisão de produto: fricção no free)
- Tela de admin para consultar aceites — a consulta é via banco por enquanto

## Critérios
- [ ] `legal_acceptance` criada com userId, documento, versão, data, IP, UA
- [ ] Primeiro login grava aceite de `termos` e `privacidade`
- [ ] Segundo login **não** duplica linha da mesma versão
- [ ] Mudar `VERSAO_LEGAL` faz o próximo login gravar linha nova, sem apagar a
      anterior
- [ ] Caminho quente do bootstrap continua em 1 query para membro em dia
