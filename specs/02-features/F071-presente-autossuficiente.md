# F071 — O presente se explica sozinho

## Status
Aplicado em produção — 2026-08-31

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

Continua valendo falar do Builders Club — o que muda é o ângulo. Em vez de
comparar o que a marca posta "lá fora" com o que entrega aqui (comparação que
só fecha para quem veio de lá), a frase diz o que a **comunidade** faz com o
assunto: é onde dá para aprofundar, perguntar e o projeto sair do papel.

**Sem "régua".** A palavra era o bordão do fecho e aparecia mais cinco vezes no
miolo dos kits. É metáfora que o leitor tem de decifrar; troca por ritmo,
teste, limite ou critério, conforme o que a frase quer dizer.

Vale para presente novo também: quem escreve o próximo kit escreve já assim.

## O que muda nos 14 presentes em produção

O bloco de fecho é idêntico em todos:

```
## Você acabou de ver a diferença

O post te mostrou <X> em oito slides. Aqui você recebeu <lista>.

Essa é a régua do **Builders Club**: a gente não larga conteúdo pra você
salvar e nunca mais abrir. O que a gente posta lá fora tem, aqui dentro, a
parte que falta pra sair do papel.

E tem mais gente aqui do lado, na mesma régua:

- **O kit X.** …
- **O kit Y.** …
- **O kit Z.** …

Bom proveito. Abraço.
```

Vira:

```
## O que você tem aqui

Aqui você tem <lista>.

Assunto como esse a gente aprofunda no **Builders Club**, com quem está
fazendo junto. É onde a dúvida vira resposta e o projeto sai do papel.

Bom proveito. Abraço.
```

A lista do que o kit entrega é o miolo da frase e não se perde — some só a
comparação com o carrossel.

A lista de outros kits sai inteira. Ela abria com "E tem mais **gente** aqui
do lado" e o que vinha depois era kit, não gente; e cada presente já é uma
porta de entrada por conta própria, não precisa mandar o leitor para as
outras. O presente termina no que ele entrega.

Além do fecho, os trechos avulsos:

| Presente | De | Para |
|---|---|---|
| `hermes` | `## A parte que o carrossel não coube: como ele aprende` | `## A parte que quase ninguém explica: como ele aprende` |
| `vaga` | `Estes são maiores que os dos slides: cada um já traz as regras…` | `Cada um já traz as regras…` |
| `vaga` | `Esta é a parte que o post de onde essa ideia saiu não conta…` | `Esta é a parte que quase ninguém conta…` |
| `grana` | `…já te põe na faixa que o carrossel mostrou.` | `…já te põe nessa faixa.` |
| `limpa` | `## O comando que o post não mostrou` | `## O comando da varredura` |
| `limpa` | `O post citou três blocos mortos. Aqui está o detalhe…` | `Foram três blocos mortos. Aqui está o detalhe…` |
| `vaga` | `a régua de ritmo que evita o LinkedIn restringir…` | `o ritmo que evita o LinkedIn restringir…` |
| `vaga` | `**A régua que salva a sua entrevista:**` | `**O teste que salva a sua entrevista:**` |
| `vaga` | `## 4. A régua: o que o LinkedIn não deixa` | `## 4. O limite: o que o LinkedIn não deixa` |
| `limpa` | `A régua dele está na documentação oficial…` | `O critério dele está na documentação oficial…` |
| `limpa` | `Essa mesma régua vale pras suas skills…` | `O mesmo critério vale pras suas skills…` |

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
- Menções legítimas de "post", "perfil" ou "legenda" dentro do conteúdo —
  `.srt` de legenda no kit do Whisper, perfil do GitHub no do Bitburner
- A página pública `/presentes/<slug>` e o bloco de promessa (F063/F067)

## Ensaio

HML tem **um** presente, e ele não cita a origem — não dá para ensaiar em
staging com dado real. O `--dry` contra produção é o ensaio, e
`--mostrar=<slug>` imprime o fecho já transformado pelo mesmo caminho que
grava, para a prévia não divergir do que vai ao ar.

## Critérios

- [x] Spec antes do código
- [x] Nenhum presente cita post, slides ou carrossel como origem do leitor
- [x] A palavra "régua" não aparece em nenhum presente
- [x] A lista do que o kit entrega continua inteira em cada fecho
- [x] Menções legítimas dentro do conteúdo ficam de pé
- [x] Script idempotente, com `--dry` e varredura final do que sobrou
- [x] Aplicado em produção nos 14 presentes (31/08/2026); busca independente
      por "régua" e pelos termos de origem voltou vazia
