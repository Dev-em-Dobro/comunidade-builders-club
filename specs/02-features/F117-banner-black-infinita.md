# F117 — Banner Black em Dobro Infinita no Builders Club

## Contexto

Campanha Black Friday 2026. A Curseduca recebe uma arte configurada pela operação; no Builders Club a faixa do topo é HTML responsivo. Referência visual: `banner curseduca bf26.png` no Drive da tarefa. A campanha tem fundo escuro, destaque turquesa, marca de infinito e chamada para a live gratuita de 05/11 às 20h.

## Decisão

1. No topo do app logado, a Black ocupa o slot único da faixa entre 21/10 e 05/11/2026, inclusive (horário de Brasília). Após 06/11 00h, volta a faixa normal. A faixa anterior não aparece empilhada.
2. A segmentação usa o `isPaid` já calculado pelo layout com `isPaidMembership`: `paid`, PRO, Elite, admin e instructor ativos são alunos; Free é não aluno.
3. Aluno vê convite para o grupo de alunos da Black de 28/10, com CTA **Entrar no grupo de alunos** para `https://sndflw.com/i/sBjl9OjmppA8znba2jc3`.
4. Não aluno vê convite para a live gratuita de 05/11 às 20h, com CTA **Entrar na lista da live** para `https://blackinfinita.devemdobro.com/`.
5. A peça é construída com texto, CSS e SVG decorativo, sem reutilizar a imagem da Curseduca. Toda a faixa é um link acessível, abre em nova aba e se adapta à largura real do conteúdo ao lado da sidebar.
6. A Curseduca é configurada manualmente pela operação e fica fora do código desta feature. Não há alteração de banco nem migration.

## Critérios de aceitação

- [x] Aluno pago vê a versão de 28/10 e vai para o grupo de alunos.
- [x] Free vê a versão de 05/11 e vai para a página da live.
- [x] Desktop e 320 px mantêm texto, data e CTA legíveis sem corte ou rolagem horizontal (prévia local).
- [x] Leitor de tela recebe o conteúdo textual e foco de teclado fica visível.
- [x] Fora da janela da Black, o topo volta à faixa anterior (teste automatizado).
- [ ] Preview validado e evidência anexada à tarefa antes de concluir a implementação.
