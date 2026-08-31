# F071 — O presente se explica sozinho

## Status
Em implementação — 2026-08-31

Depende de: [F059](F059-presentes-publicos-atribuicao.md) (presente público),
[F063](F063-funil-presente-conta-free.md) (funil), [F067](F067-copy-do-ganho-free.md) (voz).

## Contexto

Os presentes nasceram como continuação de um carrossel do Instagram: a pessoa
via oito slides lá, clicava no link e caía no kit completo. A copy foi escrita
para esse trajeto e cita o trajeto o tempo todo — "o post te mostrou … em oito
slides", "a parte que o carrossel não coube", "estes são maiores que os dos
slides".

Só que o presente **não vive só nesse trajeto**. Ele é um post do feed
(`/posts/<id>`) e uma página pública por slug (`/presentes/<slug>`). Um membro
que abre pela comunidade nunca viu carrossel nenhum, e lê um texto que se
compara com uma coisa que não existe para ele:

> Você acabou de ver a diferença
> O post te mostrou o tamanho do problema e a régua em oito slides. Aqui você
> recebeu o comando que faz a varredura…

Não é um erro de detalhe. É o texto pressupondo um leitor que pode não existir.

## Regra

**O presente se explica sozinho.** Nada no corpo pode depender de o leitor ter
visto outra peça: sem "post", sem "slides", sem "carrossel", sem "lá no meu
perfil", sem "você acabou de ver".

O que continua valendo: falar do Builders Club, do que o kit entrega, e da
régua da marca ("o que a gente posta lá fora tem, aqui dentro, a parte que
falta"). Essa frase descreve a marca, não obriga o leitor a ter vindo de lugar
nenhum.

Vale para presente novo também: quem escreve o próximo kit escreve já assim.

## O que muda nos 14 presentes em produção

O bloco de fecho é idêntico em todos:

```
## Você acabou de ver a diferença

O post te mostrou <X> em oito slides. Aqui você recebeu <lista>.

Essa é a régua do **Builders Club**: …
```

Vira:

```
## O que você tem aqui

Aqui você tem <lista>.

Essa é a régua do **Builders Club**: …
```

A lista do que o kit entrega é o miolo da frase e não se perde — some só a
comparação com o carrossel. Além do fecho, seis trechos avulsos:

| Presente | De | Para |
|---|---|---|
| `hermes` | `## A parte que o carrossel não coube: como ele aprende` | `## A parte que quase ninguém explica: como ele aprende` |
| `vaga` | `Estes são maiores que os dos slides: cada um já traz as regras…` | `Cada um já traz as regras…` |
| `vaga` | `Esta é a parte que o post de onde essa ideia saiu não conta…` | `Esta é a parte que quase ninguém conta…` |
| `grana` | `…já te põe na faixa que o carrossel mostrou.` | `…já te põe nessa faixa.` |
| `limpa` | `## O comando que o post não mostrou` | `## O comando da varredura` |
| `limpa` | `O post citou três blocos mortos. Aqui está o detalhe…` | `Foram três blocos mortos. Aqui está o detalhe…` |

## Como aplica

O corpo do presente vive no banco, escrito pelo admin — não há fonte no
repositório para editar. `scripts/fix-copy-presentes-f071.mts`, cirúrgico e
idempotente na linha da [F067](F067-copy-do-ganho-free.md): troca só os
trechos acima, só se ainda estiverem no texto antigo, e roda com
`--dry` antes para conferir.

Não usar busca-e-substitui manual pelo admin: são 14 posts e o fecho tem uma
parte variável em cada um.

## Fora de escopo

- Reescrever o miolo dos kits (o conteúdo está certo; o que sai é a moldura)
- A frase da régua do Club ("o que a gente posta lá fora…")
- Menções legítimas de "post", "perfil" ou "legenda" dentro do conteúdo —
  `.srt` de legenda no kit do Whisper, perfil do GitHub no do Bitburner
- A página pública `/presentes/<slug>` e o bloco de promessa (F063/F067)

## Critérios

- [x] Spec antes do código
- [ ] Nenhum presente cita post, slides ou carrossel como origem do leitor
- [ ] A lista do que o kit entrega continua inteira em cada fecho
- [ ] Menções legítimas dentro do conteúdo ficam de pé
- [ ] Script idempotente e com `--dry`
- [ ] HML antes de produção
