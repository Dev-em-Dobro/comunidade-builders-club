# F072 — Módulo bloqueado no catálogo: cadeado no lugar do selo "Pago"

## Status
Em implementação — 2026-08-31

Depende de: [F052](F052-catalogo-aulas-cards.md) (cards do catálogo),
[F065](F065-aulas-fase-1-free.md) (Fase 1 liberada no free),
[F067](F067-copy-do-ganho-free.md) (copy do ganho).

## Contexto

No `/aulas`, o card de módulo que o free não abre traz um selo
`🔒 PAGO` no canto da capa (`aulas-catalog.tsx:355-360`). Dois problemas,
percorrendo a tela como free:

1. **O rótulo nomeia a tranca.** "Pago" descreve o que ela não tem. A
   [F067](F067-copy-do-ganho-free.md#princípio) já fixou o oposto para toda
   tela que encontra o free — fala-se do ganho, e o separador entre os
   tiers é o **nome do plano**, nunca a ausência de um.
2. **O estado depende de ler 11px.** A capa do módulo bloqueado tem
   exatamente a mesma cor da capa do módulo aberto. Numa grade de quatro
   cards, a diferença entre "posso assistir" e "não posso" está só num selo
   pequeno, no canto, em caixa alta.

## Decisões

### 1. Sai o texto, fica o cadeado — maior

O selo vira um alvo circular só com o cadeado, de `h-3 w-3` para
`h-5 w-5`. O `LockMark` já existe e continua o mesmo ícone.

O sentido não se perde para quem não vê a imagem: entra um
`<span className="sr-only">Plano pago</span>` dentro do selo. Some o texto
da tela, não a informação.

### 2. A capa do módulo bloqueado fica cinza

`grayscale` + `opacity-75` na capa — imagem ou o gradiente de fallback.

É o que faz o estado ser lido **pela imagem**, de longe, antes de qualquer
texto: capa colorida abre, capa cinza não. O cadeado deixa de ser a única
pista e passa a ser a confirmação.

### 3. Continua clicável

O card inteiro segue sendo `<Link>` para `/aulas/<slug>`, com o mesmo
hover de borda e sombra. Bloqueado não é escondido.

É decisão, não descuido: a página do módulo é onde mora a descrição do que
ele entrega e o caminho para `/planos`. Tirar o clique devolveria a pessoa
ao beco que a [F063](F063-funil-presente-conta-free.md) e a
[F067](F067-copy-do-ganho-free.md) existem para fechar — ela precisa
**poder olhar** o que está comprando.

## Fora de escopo

- A lista de aulas dentro do módulo (`LessonRows`), que hoje mostra o texto
  "Cadeado" ao lado de "Plano pago". É o mesmo problema em outra
  superfície; entra em spec própria se for o caso.
- Qualquer mudança de gate: quem abre o quê continua decidido por
  `treeHasFreeAccess` e `isPaid`.
- Copy da página do módulo e dos modais de upgrade (F067).

## Riscos

- **Cinza demais parecer erro.** Capa sem cor pode ser lida como imagem
  quebrada ou ainda carregando. Por isso `opacity-75` e não menos, e por
  isso o cadeado fica por cima: ele marca que o cinza é intenção.

## Critérios de aceitação

- [ ] Spec antes do código
- [ ] Card bloqueado não mostra a palavra "Pago"
- [ ] O cadeado está maior e sozinho no selo
- [ ] Leitor de tela ainda anuncia "Plano pago"
- [ ] Capa do card bloqueado aparece em cinza
- [ ] Card bloqueado continua clicável, levando a `/aulas/<slug>`
- [ ] Card liberado não muda em nada — capa colorida, sem selo
- [ ] Free vê Fase 1 colorida e os demais módulos em cinza (F065)
- [ ] Pago e admin não veem selo nem cinza em módulo nenhum
- [ ] Sem migration
- [ ] Preview / HML antes de produção
