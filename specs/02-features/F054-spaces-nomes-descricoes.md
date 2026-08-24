# F054 — Nomes e descrições dos Spaces

## Status
Em desenvolvimento — 2026-08-24

## Objetivo
Os nomes e descrições de três Spaces não comunicam o que se espera do membro.
"Vitórias da galera" não instrui, "Freelas" sugere board de vagas (função do
Orion, não da comunidade) e "Projetos" não deixa claro que se trata do desafio.

## Comportamento

### Spaces afetados
Slugs permanecem inalterados — URLs, ícones do menu (`nav-icons.tsx` mapeia por
slug) e links já compartilhados continuam válidos. Muda apenas nome exibido e
descrição.

| slug | nome | descrição |
|---|---|---|
| `conquistas` | Conquistas (inalterado) | Poste suas conquistas aqui, cliente fechado, proposta aceita, ou primeiro pagamento. Conte como foi o processo pra fechar a venda, isso ajuda a comunidade a crescer |
| `freelas` | **Indicação Freela** | Se tiver um freela pra indicar pra um colega, poste aqui |
| `projetos` | **Desafio Projetos** | Poste aqui o projeto que você desenvolveu no desafio dos 7 dias. Pode ser só um site de amostra por enquanto, o importante é dar o primeiro passo, a venda vem depois |

### Conteúdo que cita os Spaces
Os posts de orientação são semeados por script e citam os nomes antigos. Devem
usar os nomes novos:

- Aviso fixado "Como usar o Builders Club"
  (`scripts/seed-aviso-boas-vindas.mts`)
- Cards do space Boas-vindas — "Como usar a plataforma" e "Para que serve cada
  Space" (`scripts/seed-welcome-cards.mts`)

Ambos são idempotentes por marcador (`linkUrl`) e **atualizam** o post existente,
então rodar o script corrige o conteúdo já publicado.

### Estado dos ambientes em 2026-08-24
Levantado por leitura direta dos bancos:

- **HML** — já aplicado à mão: nomes novos, descrições de `freelas` e
  `conquistas`, e o aviso fixado reescrito. Falta só a descrição de `projetos`.
  O texto do repo foi alinhado ao que está no ar em HML (mesma redação), então
  rodar o seed lá não gera churn.
- **PROD** — nada aplicado: nomes e descrições antigos, aviso fixado antigo e
  os dois cards de Boas-vindas (`como-usar-v1`, `spaces-v1`) citando "Freelas"
  e "Projetos".

O drift entre repo e HML era invisível: o seed do repo ainda tinha os textos
antigos, então qualquer `db:seed` a partir de um checkout desatualizado
regrediria HML. Alinhar o repo fecha essa porta.

`seed-welcome-cards.mts` deixa de sobrescrever nome/descrição do space
`boas-vindas` — esses campos pertencem a `prisma/seed.ts`.

A descrição de `boas-vindas` passa a ser a de HML — "Tutorial e os três passos
do primeiro dia" — decidida como oficial. Reflete o redesign da jornada (F051):
tela com vídeo + trilha de três passos.

### Divergência maior, fora do escopo desta feature
O space `boas-vindas` tem **conteúdos diferentes** entre ambientes:

- **HML** — 1 card ("Primeiros passos", trilha de 3 passos ao lado do vídeo)
- **PROD** — 6 cards do layout antigo (hero, primeiros passos, como usar,
  para que serve cada Space, engajamento, materiais e aulas)

`seed-welcome-cards.mts` ainda descreve o layout de 6 cards. Rodá-lo contra HML
recriaria os 5 cards que o redesign removeu. Levar o layout de HML para produção
exigiria **remover** cards em produção — mudança destrutiva, que precisa de
feature e decisão próprias. F054 não faz isso.

### Posts escritos por membros
Posts e comentários escritos direto no app só existem no banco. O script
`scripts/scan-space-mentions.mts` varre `Post` e `Comment` procurando os nomes
antigos e reporta autor, id e trecho — **não reescreve** texto de membro.
A decisão de editar cada ocorrência é humana.

## Não faz parte
- Renomear slug / mudar URL
- Editar nome e descrição de Space pela UI de admin (hoje o admin só cria e
  remove; alterar exige seed)

## Critérios
- [ ] `prisma/seed.ts` reflete os três nomes/descrições novos
- [ ] `/spaces/conquistas`, `/spaces/freelas` e `/spaces/projetos` continuam
      respondendo nos mesmos slugs
- [ ] Menu lateral mostra "Indicação Freela" e "Desafio Projetos" com os mesmos
      ícones de antes
- [ ] Aviso fixado e cards de Boas-vindas citam os nomes novos
- [ ] `scan-space-mentions` lista ocorrências residuais em posts de membros
