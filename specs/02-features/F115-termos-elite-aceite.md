# F115 — Termos do Elite com aceite obrigatório

## Status
Em validação em homologação — 2026-10-21. Texto aprovado pelos fundadores.

## Contexto
Tarefa `cmvb3vtab0001lf06bb1sajbz`: quem compra o Elite deve conhecer, antes de usar a comunidade, a diferença entre acesso vitalício às aulas gravadas e acompanhamento por um ano a partir da compra. O aceite precisa ser demonstrável.

## Decisões
- Documento próprio `termos-elite` em `legal_acceptance`, append-only, com versão, usuário, data/hora, IP e user-agent. A chave de versão combina a versão do texto com o instante da compra individual (`sem-data` quando ausente); se a data for conciliada ou houver nova compra, o prazo muda e o aceite é pedido de novo. Não reutilizar o aceite implícito dos termos gerais.
- Guardar `elite_started_at` na primeira concessão do Elite. Renovação e cobrança posterior não alteram a data. O prazo de acompanhamento é a data de aniversário de um ano da compra do Elite.
- Para membros Elite legados sem data de compra confiável, não inventar uma data: o modal explica que ela deve ser confirmada pelo suporte. A origem histórica precisa de conciliação antes de afirmar um vencimento individual.
- O layout mostra somente o modal antes do aceite, sem renderizar a navegação e o conteúdo do app. O `<dialog>` nativo bloqueia mouse e teclado, mostra o texto completo, exige checkbox e só libera após o servidor gravar o aceite. Se houver também ciente da garantia pendente, os termos vêm primeiro.
- A versão do texto é uma constante. Alteração material exige nova versão e novo aceite. O texto aprovado deve ser mantido no histórico Git.
- O gate é no layout do app e segue o padrão da F090. A página pública de termos gerais permanece acessível.

## Critérios
- [ ] Todo Elite ativo sem aceite da versão vigente vê o modal no primeiro acesso após a compra ou upgrade.
- [x] Aulas gravadas são descritas explicitamente como vitalícias; lives, suporte e mentoria terminam um ano após a compra do Elite.
- [x] A data individual de término aparece quando a compra tem data confiável; ausência de data é explícita.
- [x] Checkbox inicia desmarcado; botão desabilitado até marcá-lo; erro de gravação mantém o bloqueio.
- [x] Aceite persiste usuário, versão, data/hora e contexto de origem, sem duplicar.
- [ ] Layout funciona em desktop e celular.
- [ ] Verificado em conta Elite de teste antes da publicação.
- [x] Texto validado pelos fundadores em 2026-10-21.

## Minuta do texto para validação

> **Termos de uso do Elite**
>
> Leia os termos completos abaixo antes de continuar. Eles explicam o que permanece disponível e quando termina o acompanhamento do Elite.
>
> **Aulas gravadas: acesso vitalício.** As aulas gravadas incluídas no Elite têm acesso vitalício. O fim do período de acompanhamento não encerra o acesso a essas aulas.
>
> **Acompanhamento: 1 ano.** Lives, suporte e mentoria são o acompanhamento do Elite. Esse acompanhamento dura 1 ano a partir da compra do Elite. Ele não é vitalício. Após esse prazo, as aulas gravadas continuam disponíveis, mas lives, suporte e mentoria deixam de fazer parte do acesso contratado.
>
> **Seu prazo.** Sua compra do Elite foi em **[data da compra]**. Seu acompanhamento termina em **[data de término]**.
>
> Se a data não existir no registro histórico: **Data de término pendente de confirmação.** A data da sua compra do Elite não está registrada com segurança nesta plataforma. O prazo é de 1 ano a partir da compra. Consulte seu comprovante ou entre em contato com o suporte para confirmar a data exata de término do seu acompanhamento.
>
> ☐ Li e aceito os termos de uso do Elite.
