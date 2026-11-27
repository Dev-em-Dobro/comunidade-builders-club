# F127 — E-mail de acesso após a compra

## Status
Em implementação — 2026-11-27

Depende de: [F126](F126-aula-avulsa-hubla.md) (aula avulsa via Hubla),
[F053](F053-ofertas-pro-elite.md) (ofertas PRO/Elite),
[F059](F059-presentes-publicos-atribuicao.md) (login por código no e-mail),
[F085](F085-metricas-email-resend.md) (categorias de e-mail).

## Contexto

Hoje o Club não manda nada quando alguém compra. O webhook da Hubla libera
o acesso pelo e-mail e para aí. O comprador depende do e-mail da Hubla para
descobrir que precisa entrar no Club com o mesmo e-mail da compra.

Com o **CRM com IA** (módulo `crm-com-ia`, F124) vendido como produto de
entrada, a Hubla passa a só cobrar. O acesso e a mensagem saem do Club.

## Objetivo

Quando o webhook libera um acesso, o Club manda **um** e-mail para o
comprador dizendo o que foi liberado e como entrar.

## Quando envia

| Compra | Gatilho | Texto |
|--------|---------|-------|
| Módulo avulso (F126) | `aplicarAulaAvulsa` com ação `liberar` | Módulo |
| PRO | `aplicarAcaoAllowlist` com ação `conceder`, plano `pro` | PRO |
| Elite e vitalício | idem, plano `elite` | Elite |

Não envia em: reembolso, remoção, evento ignorado, liberação manual pelo
admin ou por script.

## Uma vez por compra

Tabela nova `purchase_email_send`:

| Campo | Papel |
|-------|-------|
| `email` | e-mail normalizado do comprador |
| `chave` | `modulo:<moduleId>`, `plano:pro` ou `plano:elite` |
| `sent_at` | preenchido quando o envio deu certo |
| `erro` | última falha de envio, se houve |

Único por (`email`, `chave`). O envio só acontece se a linha foi criada
agora. Isso cobre:

- aviso repetido da Hubla com outra chave de idempotência;
- mensalidade do PRO Mensal, que chega como compra todo mês: só a primeira
  manda e-mail.

Reembolso ou remoção apaga a linha daquela chave. Quem compra de novo
recebe o e-mail de novo. No reembolso de plano, as duas chaves de plano
saem (o evento não diz qual plano foi reembolsado).

### Quem já tinha acesso

A migration marca como "já avisado" quem tinha acesso antes desta feature,
com `erro = 'anterior-f127'` e `sent_at` vazio. Sem isso, a próxima
mensalidade de um assinante antigo mandaria "Seu acesso PRO".

- compras de módulo existentes: chave do módulo;
- membros `paid`/`pro`: `plano:pro`; membros `elite`: as duas;
- e-mail na allowlist sem conta: as duas (a allowlist não guarda o plano).

PRO antigo que sobe para Elite ainda recebe o e-mail do Elite.

## Regras

- **Falha de envio não derruba o webhook.** O acesso já foi liberado; o
  erro fica em `erro` e no log. A Hubla não reenvia por causa disso.
- Envio dentro do request (sem fila), com limite de 5 s. O webhook tem
  teto de 20 s.
- Vai para todos os e-mails do evento que receberam o acesso.
- Vale com ou sem conta no Club. O texto não muda.
- Quem já é PRO ou Elite e compra um módulo avulso recebe o e-mail do
  módulo mesmo assim.
- Categoria Resend nova: `compra` (entra em `EMAIL_CATEGORIAS`, F085).

## Conteúdo

Assunto contém "Builders Club" (filtro das métricas, F085).

| Texto | Assunto | Corpo |
|-------|---------|-------|
| Módulo | `Seu acesso ao <título do módulo> — Builders Club` | as aulas do módulo foram liberadas |
| PRO | `Seu acesso PRO — Builders Club` | formação completa, materiais, espaços, busca e Orion |
| Elite | `Seu acesso Elite — Builders Club` | tudo do PRO, grupo de WhatsApp, lives e CMS |

Todo e-mail traz:

1. o que foi liberado;
2. o e-mail da compra, escrito por extenso: "entre com **este** e-mail";
3. botão **Entrar no Builders Club** para `/login`;
4. como funciona o login: o Club manda um código para o e-mail (F059).

O título do módulo vem do banco. O texto do módulo é genérico: serve para
o CRM e para qualquer aula avulsa futura.

### Por que o botão não loga direto

O link mágico do Club vale 5 minutos. O e-mail de compra é aberto horas ou
dias depois. Um link que loga sozinho exigiria um token de longa duração
no e-mail, e isso é superfície nova de autenticação. Fica fora desta
feature; o login por código já resolve em um passo.

## Fora do escopo

- WhatsApp (sem serviço de envio; exigiria ADR).
- Link de acesso que já loga.
- Levar a pessoa direto ao módulo comprado depois do login (fica na F128).
- Reenviar o e-mail pelo admin.
- Desligar o e-mail de boas-vindas da Hubla (painel da Hubla).

## Critérios

- [ ] Compra do produto vinculado a um módulo manda o e-mail do módulo, com o título certo
- [ ] Compra do PRO manda o e-mail PRO; Elite e vitalício mandam o Elite
- [ ] Aviso repetido da Hubla não manda segundo e-mail
- [ ] Segunda mensalidade do PRO Mensal não manda e-mail
- [ ] Reembolso seguido de nova compra manda o e-mail de novo
- [ ] Comprador sem conta recebe o e-mail e consegue entrar pelo código
- [ ] Falha no Resend: webhook responde sucesso, acesso liberado, erro registrado
- [ ] E-mail aparece na categoria `compra` das métricas
