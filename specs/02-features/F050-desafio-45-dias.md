# F050 — Desafio 45 dias até o primeiro freela

## Status
Em implementação — 2026-11-26 (fatia A em Preview; decisões provisórias marcadas em "Decisões em aberto")

## Objetivo
Levar qualquer membro pago — veterano ou recém-chegado — a fechar o **primeiro
cliente em 45 dias**, forçando a rotina de **prospecção**. O desafio mede o que
a pessoa controla (abordagens, retornos, aulas, check-ins); resposta e venda são
acompanhadas e celebradas, mas **não** definem se ela está "em dia".

Princípios:
- Sem prospecção não há cliente → a meta semanal é de **abordagens**.
- Quente primeiro (rede próxima e negócios locais = primeiro "sim" mais rápido),
  frio em paralelo desde o dia 1 via Orion.
- O membro deve conseguir avançar **sem depender da equipe**: missão do dia,
  meta da semana sempre à mão (scripts e modelos seguem em Materiais, F019).
- A equipe enxerga quem está atrasado e cobra.

## Turma
| Item | Valor |
|------|-------|
| Edição | Turma única — 1/12/2026 (ter) a 14/1/2027 (qui) |
| Quem participa | **Somente membros pagantes**: `Membership.tier = paid` (F041), qualquer origem (Hubla, TMB, allowlist manual/DevQuest), mais `admin`/`instructor`. Gate só pelo tier, sem filtrar por origem |
| Inscrição | **Formulário de cadastro** no menu Desafio (ver "Cadastro"). Telas do desafio só liberam após cadastro aprovado. Aberto até 14/12 (fim da semana 2) |
| Semana do desafio | **terça → segunda** (S1 = 1–7/12). Check-in na segunda, encontro ao vivo na terça |
| Fuso | `America/Sao_Paulo` para dias, semanas e contagens |

Quem entra depois do dia 1 não é cobrado pelas semanas anteriores à entrada.

## Cadastro (antes de liberar o desafio)
Objetivo: filtrar quem vai se dedicar de verdade e dar contexto à equipe.

Campos:
- WhatsApp (obrigatório — canal de cobrança)
- Momento atual: `nunca fiz freela` | `já fiz, mas sem cliente recorrente` | `já tenho clientes`
- Oferta/nicho que pretende vender (texto curto; pode ser "ainda não sei")
- Horas por semana disponíveis para o desafio: `menos de 3h` | `3–5h` | `5–10h` | `mais de 10h`
- Já tem portfólio publicado? (sim/não)
- Tem 30 contatos quentes para abordar na primeira semana? (sim/não)
- Por que você quer fechar o primeiro cliente agora? (texto curto, obrigatório)
- Compromissos (todos obrigatórios para enviar):
  - [ ] Faço as metas mínimas de abordagem toda semana
  - [ ] Registro minhas abordagens (quentes aqui, frias no Orion)
  - [ ] Envio o check-in toda segunda
  - [ ] Entendo que posso ser removido se ficar 2 semanas sem atividade
  - [ ] Entendo que, sem cumprir as metas, não vou conseguir o resultado de fechar um cliente em 45 dias

Regras:
- Respostas ficam visíveis para a equipe no painel (`/admin/desafio`).
- Status do cadastro: `pendente` → `aprovado` | `recusado`; admin pode remover
  depois (`removido`), com motivo.
- Modo de aprovação: flag `CHALLENGE_AUTO_APPROVE`. Com `true`, o cadastro nasce
  `aprovado` quando os 5 compromissos estão marcados e as horas são ≥ 3h/semana;
  em qualquer outro caso (flag ausente ou `false`, ou `menos de 3h`) nasce `pendente`.
- `recusado`/`removido` mostram o motivo; o membro não reenvia sozinho.
- Enquanto `pendente`, `/desafio` mostra "Cadastro em análise".

## Fases

| Fase | Semanas | Datas | Foco |
|------|---------|-------|------|
| **1 · Rede quente** | S1 | 1–7/12 | Oferta e nicho, abordar **no mínimo 30 contatos quentes**, portfólio simples publicado, começar Orion |
| **2 · Volume** | S2–S3 | 8–21/12 | Rotina diária de abordagens frias + retorno a todos que responderam |
| **3 · Manter aquecido** | S4–S5 | 22/12–4/1 | Festas: só conversas ativas, agendar retornos de janeiro; retomada leve em 4/1 |
| **4 · Fechar** | S6 + encerramento | 5–14/1 | Retomada forte, negociação, registrar resultado final |

**Trilha Oportunidade** (paralela, aberta desde o dia 1, não é fase):
`interessado → briefing → proposta → fechado → entregue`. Qualquer contato
(quente ou frio) pode entrar nela em qualquer dia.

## Metas semanais (mínimo — pode e deve fazer mais)

| Semana | Quentes | Frias (Orion) | Outros requisitos |
|--------|---------|---------------|-------------------|
| S1 (1–7/12) | **30 (mínimo)** | 40 | Link do portfólio no check-in; aulas da Fase 1 |
| S2 (8–14/12) | — | 30 | Aulas da Fase 2; todo contato que respondeu com retorno feito |
| S3 (15–21/12) | — | 30 | Interessados com próximo passo (briefing/proposta/retorno agendado) |
| S4 (22–28/12) | — | — | Só check-in |
| S5 (29/12–4/1) | — | 10 | Check-in |
| S6 (5–11/1) | — | 30 | Check-in |
| Encerramento (12–14/1) | — | — | Registrar resultado final |

Acumulado esperado: 30 quentes + 140 frias (mínimos). Check-in semanal é obrigatório em
todas as semanas e faz parte do marco.

**Marco da semana** = todas as metas da linha + check-in enviado.

### O que conta como abordagem
- **Abordagem**: primeira mensagem individual enviada a um contato e registrada.
- **Retorno**: mensagem seguinte ao mesmo contato. Métrica separada; não conta
  como abordagem.
- Contato encontrado ou mensagem gerada sem envio **não** contam.
- **Quente**: registrada na comunidade (ver Contatos quentes).
- **Fria**: `Outreach` do Orion com `enviado = true`; a data é `enviado_em`.
  Primeiro envio a um lead = abordagem; envios seguintes ao mesmo lead = retorno.

## Contatos quentes (na comunidade)
Pessoas próximas e negócios locais. Cadastro simples:
- nome, tipo (`pessoa` | `negocio`), canal/observação (texto livre opcional)
- status: `listado → abordado → respondeu → briefing → proposta → fechado` | `perdido`
- datas gravadas: `abordadoEm` (ao entrar em `abordado`) e data de cada mudança
  de status
- botão **"Registrei um retorno"** (incrementa retornos, grava data)
- valor do fechamento (opcional) ao marcar `fechado`

Só o dono vê os próprios contatos; admin/instructor veem no painel da equipe.

## Integração Orion (abordagens frias)
Bancos continuam **separados**. O Orion expõe um endpoint de estatísticas
**somente leitura**, e o Builders consulta.

- Vínculo pelo **e-mail** do usuário (mesmo e-mail nas duas contas). Se não
  encontrar, o painel mostra "Conta Orion não encontrada com este e-mail".
- Contrato (proposto, a especificar no repo Orion):
  `POST {ORION_URL}/api/integracoes/builders/estatisticas`
  - Header `Authorization: Bearer {BUILDERS_INTEGRATION_SECRET}`
  - Body `{ emails: string[], desde: "YYYY-MM-DD", ate: "YYYY-MM-DD" }`
  - Resposta: `{ resultados: [{ email, encontrado, dias: [{ data, abordagens, retornos }],
    funil: { respondeu, qualificado, proposta, ganho } }] }` (máx. 500 e-mails por chamada)
- **Retroativo**: como o Orion guarda `enviado_em`, abordagens feitas antes da
  integração entrar no ar contam normalmente.
- Builders faz cache de ~10 min (sem worker/fila; consulta no request).
- Limitação conhecida: o Orion não guarda a data de cada mudança de
  `LeadStatus`; o funil frio é um retrato do status atual dos leads criados
  dentro da janela do desafio.

## Aulas obrigatórias
- Cada aula obrigatória pertence a uma fase (mapeamento configurado por seed
  no MVP; admin em iteração futura).
- Mapeamento inicial (a confirmar com os módulos de produção):
  - Fase 1: *Renda extra com IA e Claude Code*, *Sites que vendem e o agente
    que atende sozinho*, *Do nicho ao primeiro cliente*
  - Fase 2: *Mentoria: destravando a prospecção*, *Do "gostei" ao dinheiro na conta*
- Concluída = `LessonProgress.completedAt` preenchido (F011). Aula não concluída
  até o fim da fase fica **atrasada**.
- Painel mostra "Aulas obrigatórias: X de N" com links para as que faltam.
- Risco: hoje concluir é um clique. Se o player do Panda reportar tempo
  assistido, exigir % mínimo numa iteração futura.

## Check-in semanal (segunda)
Formulário curto, um por semana:
- "Onde você travou?" (obrigatório, texto curto)
- S1: link do portfólio publicado (obrigatório)
- Venda fechada nesta semana? (sim/não + valor opcional)
- Os números da semana são **pré-preenchidos** (quentes da comunidade + frios do
  Orion) — o membro não digita números.

Check-in pode ser enviado de segunda até terça 12h (antes do encontro).

## Pontuação

| Ação | Pontos |
|------|--------|
| Abordagem fria enviada (Orion) | 2 |
| Abordagem quente (contato → `abordado`) | 3 (máx. 40 quentes pontuadas por semana) |
| Retorno registrado (quente ou frio) | 1 |
| Briefing (quente `briefing`, frio `qualificado`) | 10 |
| Proposta | 20 |
| Fechado / ganho | 100 |
| Aula obrigatória assistida | 1 |
| Check-in enviado | 5 |
| Marco da semana batido | +30 e selo da semana |

Aula vale 1 ponto, para que assistir vídeo nunca valha mais que prospectar
(o bônus de "todas as aulas da fase" saiu junto).

### Selos
- **Semana N** — marco da semana batido (um selo por semana).
- **Sequência 7** — 7 dias seguidos com pelo menos uma abordagem ou retorno.
- **Primeiro cliente** — primeiro `fechado`/`ganho`.
- **Constância total** — todos os marcos batidos.

Selos aparecem no painel do desafio e no perfil do membro.

### Ranking
- **Ranking da semana** por pontos ganhos na semana; zera toda terça (quem
  entrou atrasado ainda disputa).
- **Ranking geral** dos 45 dias.

### Prêmios (proposta — equipe escolhe)
| Conquista | Prêmio |
|-----------|--------|
| Marco S1 | Revisão do portfólio pela equipe |
| Marcos S1+S2+S3 | Prioridade de hot seat no encontro de terça (análise da abordagem ou da proposta ao vivo) |
| Primeiro cliente (≥1 fechado dentro do desafio) | **4 encontros de Hot Seat em grupo com os gêmeos** para acompanhar os trabalhos fechados (definido) + destaque em Conquistas (post sugerido, membro confirma) + selo |
| Constância total | Mentoria individual de 30 min com a equipe + certificado |
| Top 3 do ranking geral | Prêmio maior (a definir: acesso extra, mentoria estendida, brinde) |

Prêmios premiam **constância**; o ranking só define o prêmio maior.

## Menu e telas (membro)
Item **Desafio** na lateral (após Aulas).
- `free`: item com cadeado → modal de upgrade (padrão F041).
- `paid` não inscrito: página de apresentação + "Quero participar".
- Inscrito:

| Rota | Conteúdo |
|------|----------|
| `/desafio` | **Hoje**: dia X/45, fase, missão do dia, barra da meta da semana (quentes, frias, aulas, check-in), farol em dia/atrasado, pontos e posição, próximo check-in, selos |
| `/desafio/calendario` | 45 dias com fases, missões e marcos; dias passados com ✓/✗ do marco |
| `/desafio/contatos` | Contatos quentes: lista + funil, ações rápidas de status e retorno |
| `/desafio/checkin` | Check-in da semana e histórico |
| `/desafio/ranking` | Ranking da semana e geral, selos |

Missões diárias, metas, fases e textos do calendário ficam versionados no repo
(`src/lib/desafio/calendario.ts`), conforme o roteiro do desafio (texto curto de
cada dia do canvas de design; dias marcados como `leve` = pausa/opcional).

Detalhes de tela:
- Abas internas: Hoje · Calendário · Contatos quentes (N) · Check-in · Ranking
  (Ranking entra com a fatia C).
- Farol sempre com texto: verde "Em dia", amarelo "Atenção", vermelho "Atrasado".
- Fase concluída aparece em verde com estrela na faixa de fases do Hoje.
- Na fatia A, frias aparecem como "Integração com o Orion em breve" e o marco
  da semana ignora a meta de frias.
- Celular (< 768px): ações "+ Contato quente" e "Abrir Orion" fixas no rodapé.
- Item do menu: bloco destacado "Desafio 45 dias" com "Dia X de 45 · Fase N"
  (antes de 1/12: "Começa em 1/12"); sem selo de texto até a decisão em aberto.
- Contato quente: "Agendar retorno" grava a data combinada (evento
  `agendamento`) e conta como próximo passo na S3. Alertas no quadro:
  "Responder hoje" (respondeu e ainda sem retorno) e "Sem resposta há N dias"
  (abordado ou proposta parados há 3+ dias).
- QA: admin/instructor podem simular a data com `?agora=AAAA-MM-DD` fora de
  produção (`VERCEL_ENV != production`); só muda a leitura, nunca as gravações.


## Painel da equipe
`/admin/desafio` (admin e instructor; aprovar/recusar/remover só admin,
instructor só leitura). Abas: **Inscritos** e **Cadastros pendentes** (Prêmios a
entregar entra com a fatia C). Link a partir do `/admin`.
- Lista de inscritos: nome, semana de entrada, farol, quentes/frias da semana e
  acumulado, aulas obrigatórias X/N, último check-in, "onde travou", portfólio,
  último registro, conta Orion vinculada, vendas declaradas.
- Filtros: **atrasados**, sem check-in, sem conta Orion, com proposta aberta.
- Totais da turma: inscritos, % em dia, abordagens, propostas, vendas.
- Exportar CSV.

### Farol
- **Verde** — dentro do ritmo da meta da semana (proporcional aos dias
  passados) e registro nos últimos 2 dias.
- **Amarelo** — abaixo do ritmo **ou** 2–3 dias sem registro.
- **Vermelho** — 4+ dias sem registro **ou** marco da semana anterior não batido.
- Semanas 4–5 (festas) só ficam vermelhas por falta de check-in.

"Registro" = abordagem/retorno (quente ou frio), mudança de status de contato,
aula concluída ou check-in.

## Modelo de dados (Builders)
- `ChallengeEnrollment` (userId, status, respostas do cadastro, appliedAt,
  approvedAt, joinedWeek, removedReason?)
- `WarmContact` (userId, name, kind, note, status, approachedAt, followUps,
  closedValue, timestamps) + `WarmContactEvent` (contactId, type, at) para
  pontos e farol por data
- `ChallengeCheckin` (userId, week, blocker, portfolioUrl?, soldThisWeek,
  soldValue?, submittedAt) — único por (userId, week)
- `ChallengeRequiredLesson` (lessonId, phase)
- Pontos e selos **calculados** a partir dos eventos (sem tabela de saldo); cache
  por request.

## Fatias de entrega
| Fatia | Escopo | Prazo alvo |
|-------|--------|------------|
| **A — estreia** | Menu + gate + inscrição; Hoje; calendário; contatos quentes; aulas obrigatórias; check-in; painel da equipe (sem frias) | 1/12 |
| **B — Orion** | Endpoint no Orion (spec própria lá) + consumo no Builders; frias no painel, metas e farol (retroativo) | até 7/12 (1º check-in) |
| **C — gamificação** | Pontos, selos, rankings, selos no perfil | até 8/12 (1º checkpoint) |
| **D — depois** | Post sugerido em Conquistas; aviso automático de atraso (exige decisão sobre cron, hoje fora do MVP); % assistido nas aulas | — |

## Fora de escopo
- Registrar leads frios na comunidade (frio vive só no Orion).
- Escrever no Orion a partir do Builders.
- Pagamentos ou entrega de prêmios automatizada.
- Múltiplas turmas simultâneas (o modelo deixa espaço, mas a UI assume uma).

## Decisões em aberto
- [ ] Aprovação do cadastro: automática ou manual? **Provisório:** suportadas as
  duas pela flag `CHALLENGE_AUTO_APPROVE` (padrão manual).
- [ ] Frias nas semanas 2 e 3: 30 (calendário atual) ou 40 (resumo do roteiro)?
  **Provisório:** 30.
- [ ] Confirmar mapeamento das aulas obrigatórias com os módulos de produção.
  `scripts/seed-desafio-aulas.mts` casa por título e lista o que não achou; os
  títulos acima não existem no catálogo de homologação (26/11).
- [ ] Texto do selo do menu: "AO VIVO", "NOVO" ou nenhum.
- [ ] Prêmios finais.

## Critérios de aceitação
- [ ] `free` vê Desafio com cadeado; `paid` vê apresentação e o formulário de cadastro
- [ ] Cadastro só envia com todos os compromissos marcados; telas do desafio só liberam após aprovação
- [ ] Equipe vê as respostas do cadastro e pode aprovar/recusar/remover com motivo
- [ ] Inscrição fecha após 14/12; quem entra depois não é cobrado pelas semanas anteriores
- [ ] `/desafio` mostra dia, fase, missão e meta da semana corretos no fuso de SP
- [ ] Contato quente: criar, mudar status, registrar retorno; `abordado` conta para a meta
- [ ] Aulas obrigatórias: X de N, atrasadas ao fim da fase
- [ ] Check-in: um por semana, números pré-preenchidos, link de portfólio obrigatório na S1
- [ ] Painel da equipe com farol e filtro de atrasados
- [ ] (B) Frias do Orion por e-mail, retroativas, com cache; e-mail sem conta Orion sinalizado
- [ ] (C) Pontos conforme tabela, limite de 40 quentes pontuadas por semana, selos e rankings (semanal zera na terça)
