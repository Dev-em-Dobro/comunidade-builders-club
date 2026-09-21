# F092 — Aulas no topo do menu + capas de módulo em 16:9

## Status
Em desenvolvimento

## Problema

Dois sintomas, um diagnóstico comum: a formação é o produto, mas a UI trata
como apêndice.

### 1. `Aulas` estava enterrada no rodapé
A F062 empurrou `Aulas` para o rodapé da sidebar, junto de Orion, Notificações
e Admin. Esse bloco é zona de **conta e ferramentas** — o membro só olha para lá
quando quer sair, trocar tema ou ver notificação. A formação não é ferramenta,
é destino: a par do Feed.

### 2. As capas de módulo estão desenquadradas
O card do catálogo renderiza `aspect-video` (16:9), mas nenhuma das seis capas
é 16:9:

| Módulo | Arquivo | Dimensão | Proporção |
|---|---|---|---|
| FASE 1 — Do zero ao primeiro sim | `/1-renda-extra.png` | 1254×1254 | 1:1 |
| FASE 2 — Entregar e ligar a recorrência | `/2-entregar-recorrencia.png` | 1536×1024 | 3:2 |
| Formação IA e Automações | `/3-ia-automacoes.png` | 1536×1024 | 3:2 |
| Automações com n8n | `/thumb-automacoes-n8n.png` | 400×600 | 2:3 |
| IA Aplicada | `/thumb-ia-aplicada.png` | 400×600 | 2:3 |
| Fundamentos do Builder Profissional | `/4-fundamentos-builder.png` | 1536×1024 | 3:2 |

Consequências concretas:

- A 1:1 perde **44% da altura** no corte — o enquadramento da arte (notebook
  centralizado) vira uma faixa do meio, sem respiro.
- As duas `thumb-*` são **pôsteres verticais com o título escrito dentro da
  arte**. No corte 16:9 o texto some inteiro — e, se não sumisse, duplicaria o
  título que o card já imprime logo abaixo.
- As duas `thumb-*` têm 400px de largura para um card que chega a ~420 CSS px:
  **borradas** em qualquer tela retina.
- Os PNG de fase pesam ~2 MB cada no repositório.
- A paleta da marca é **teal** (`#0d9488` claro / `#14b8a6` escuro). As capas
  atuais são laranja/roxo e ciano/rosa — não conversam com o produto.

Fora do card, o mesmo arquivo ainda era renderizado em duas caixas de proporção
**diferente**, então cada superfície mostrava um recorte distinto da mesma arte:
`h-12 w-9` (3:4, retrato) na árvore de módulos e `h-8 w-6` (3:4) no admin.

## Decisões

### 1. `Aulas` sobe para logo depois do `Feed`
Mesmo estilo de item (`nav-space`) do Feed, dos Spaces e dos Materiais — não o
`btn-ghost` do rodapé. Sai do `SidebarFooter`. Vale na sidebar desktop e no
drawer mobile, que compartilham o mesmo componente.

**Sem cadeado**, mantendo o comportamento de hoje: a F065 libera o M01 no
gratuito e a F067 fixou que a página `/aulas` explica o que o free já ganha.
Trancar a porta de entrada esconderia justamente a prova de valor.

### 2. Todas as capas de módulo são 16:9
O card mostra título, descrição e barra de progresso **fora** da imagem. Logo a
arte não precisa carregar texto — e não deve, porque duplicaria o título e
quebraria em qualquer corte. 16:9 é o formato que o layout já pede.

> **Por que não pôster vertical (2:3, estilo Netflix):** o pôster só funciona
> quando o título mora dentro da arte e não há descrição nem progresso ao redor.
> Nosso card tem os três. Vertical obrigaria a remover texto que hoje informa a
> escolha do membro, para ganhar só estética.

### 3. Uma proporção só, em todas as superfícies
`aspect-video` no card do catálogo, na árvore de módulos e no admin. O mesmo
arquivo passa a mostrar o mesmo recorte em qualquer lugar do produto.

As thumbs de aula na lista também passam a ser 16:9 exato (eram 20/12 ≈ 1.67 no
mobile e 24/14 ≈ 1.71 no desktop — dois recortes distintos da mesma arte).

### 4. As imagens continuam sendo arquivos, não bytes no banco
`Module.coverImageUrl` e `Lesson.thumbnailUrl` guardam **caminho**, não imagem.
Os caminhos são semeados em `scripts/seed-aulas-panda.mts`.

Trocar a arte de um módulo = **sobrescrever o arquivo em `public/` com o mesmo
nome**. Sem migration, sem rodar seed de novo, sem mexer no banco. Só deploy.

## Especificação das capas novas

Para quem for gerar (IA ou design):

- **Proporção:** 16:9. **Resolução:** 1600×900 (2x do maior card renderizado).
- **Formato:** `.webp` qualidade ~82, ou `.png` se precisar. Alvo: **< 300 KB**.
- **Sem texto na arte.** Nenhum título, subtítulo ou selo — tudo isso o card já
  desenha por cima/abaixo, com a fonte e a cor do tema.
- **Paleta:** teal da marca (`#0d9488` / `#14b8a6`) como cor de luz dominante,
  sobre base escura (`#0b1211`–`#141c1a`). Evitar laranja, roxo e rosa.
- **Composição:** assunto fora do centro exato e longe das bordas — o canto
  superior direito recebe o selo de cadeado (F072) quando o módulo é pago.
- **Contraste baixo o suficiente** para o card bloqueado continuar legível em
  `grayscale opacity-75` (F072).

Arquivos a substituir, mantendo o nome:

```
public/1-renda-extra.png            → FASE 1 — Do zero ao primeiro sim
public/2-entregar-recorrencia.png   → FASE 2 — Entregar e ligar a recorrência
public/3-ia-automacoes.png          → Formação IA e Automações
public/thumb-automacoes-n8n.png     → Automações com n8n
public/thumb-ia-aplicada.png        → IA Aplicada
public/4-fundamentos-builder.png    → Fundamentos do Builder Profissional
```

> Se o arquivo novo for `.webp`, o nome muda de extensão — aí o caminho precisa
> ser atualizado em `scripts/seed-aulas-panda.mts` **e** no banco (pelo `/admin`
> ou por script). Manter `.png` evita esse passo.

## Critérios

- [ ] `Aulas` aparece logo abaixo de `Feed`, acima do divisor dos Spaces
- [ ] `Aulas` usa o mesmo estilo dos demais itens de navegação (`nav-space`)
- [ ] `Aulas` fica ativo (`nav-space-active`) em `/aulas` e nas rotas filhas
- [ ] `Aulas` sumiu do rodapé da sidebar
- [ ] Drawer mobile tem `Aulas` na mesma posição
- [ ] Membro free vê `Aulas` sem cadeado
- [ ] Capa de módulo renderiza 16:9 no card do catálogo, na árvore e no admin
- [ ] Thumb de aula renderiza 16:9 exato em mobile e desktop
- [ ] Capas novas em 1600×900, sem texto embutido, na paleta teal
- [ ] Nenhuma capa acima de 300 KB
