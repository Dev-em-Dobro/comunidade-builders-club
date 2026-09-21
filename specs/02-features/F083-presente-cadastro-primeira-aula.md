# F083 — Cadastro do rodapé do Presente cai na primeira aula

## Status
Em implementação — 2026-09-08

## Objetivo

Os dois CTAs de cadastro no Presente precisam entregar o mesmo destino.
A pop-up (F078) já manda a conta nova para a primeira aula do módulo
gratuito **Comece por aqui**. O botão "Criar conta grátis" do bloco de
promessa âncora no formulário do rodapé, que é montado **sem**
`redirectTo` e cai em Boas-vindas.

Boas-vindas está morta: desde 05/09 (F080) o vídeo teve 1 pessoa e 8
segundos. No mesmo período as aulas tiveram 26 pessoas e 17 plays
passando de 2 minutos. Quem chega na aula assiste.

A pop-up converte 11,4% (48 contas em 421 acessos desde 04/09). O
rodapé não pode continuar trocando o prêmio.

## O que muda

No `GiftSignupForm` do rodapé do Presente (`presente-publico.tsx`),
passar `redirectTo={AULA_ABERTURA_HREF}` — o mesmo href da pop-up
(`/aulas/fase-1-m01-comece-por-aqui/aula-introducao-builders-club`).

`/cadastro` genérico continua com o default (Boas-vindas). Só o
Presente público.

A F048 redireciona quem nunca viu Boas-vindas se a sessão cair em `/`
(o feed). O OTP sem `callbackURL` fazia isso: a conta nascia, o app
abria o feed, e a pessoa via o tutorial em vez da aula. Por isso o
cadastro do Presente passa `callbackURL` e navega com
`window.location.assign` para a aula — pop-up e rodapé.

## Métrica

Conta nova que volta num segundo dia. Hoje 2 de 54 (3,7%).

## Fora de escopo

- Mudar a pop-up
- Apagar Boas-vindas
- `/cadastro` sem origem de presente
- Banner "Acesse Boas-vindas" para quem já tem conta e ainda não viu
  aquele space

## Critérios

- [x] Spec antes do código
- [x] Rodapé do Presente redireciona conta nova para a mesma aula da pop-up
- [x] `/cadastro` genérico não muda
