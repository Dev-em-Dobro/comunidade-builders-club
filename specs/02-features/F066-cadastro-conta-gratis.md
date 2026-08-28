# F066 — Login vs criar conta grátis (estilo Skool)

## Status
Em implementação — 2026-08-28

## Objetivo

`/login` mistura entrada e cadastro num formulário só. Quem não conhece o
Club não vê um caminho de **criar conta grátis**. Recortar como o Skool:
login para quem já é membro; cadastro explícito para quem ainda não é.

Não muda o modelo de plano. **Criar conta grátis = `tier: free`**, o que
o bootstrap ([F041](F041-funil-freemium.md)) já faz quando o e-mail não
está na allowlist. Pagar continua em `/planos` / Hubla. Sem senha (stack:
Google + magic link / OTP).

## Como é hoje

- [`/login`](../../src/app/login/page.tsx) — Google + magic link. O mesmo
  fluxo **cria** a conta se o e-mail for novo (`disableSignUp: false`).
- Nome + código OTP já existem no presente e em `/cadastro/[utmContent]`
  (`GiftSignupForm`).
- Bootstrap: `tier: free` se não for allowlist / admin.

## Decisão

Não há seletor “quero free vs PRO”. Quem clica **Criar conta grátis**
entra free. Allowlist no mesmo e-mail sobe para PRO no bootstrap, como
hoje.

O Skool pede senha. Aqui o equivalente é o **código de 6 dígitos** no
e-mail (mesmo fluxo do presente).

## UI

### `/login`

Rodapé do card: “Não tem conta? **Criar conta grátis**” → `/cadastro`.

Google e magic link continuam para quem já tem conta.

### `/cadastro`

Landing genérica (sem `utm`). Convive com `/cadastro/[utmContent]`
(Instagram / origem). Não grava cookie de origem: isso é só quando há
`utmContent` no path ou na query.

Reusa `GiftSignupForm`: nome, sobrenome, e-mail, código OTP. Headline:
“Crie sua conta no Builders Club”. Depois do código →
`/spaces/boas-vindas`.

Rodapé: “Já tem conta? **Entrar**” → `/login`.

Google no cadastro fica de fora nesta entrega.

## Fora de escopo

- Senha
- Escolher PRO/Elite nessa tela
- Mudar regras de tier / allowlist / Hubla
- Redesign pixel-a-pixel do Skool

## Critérios

- [x] Spec antes do código
- [x] `/login` tem o link Criar conta grátis
- [x] `/cadastro` pede nome + e-mail + código (sem senha)
- [x] Conta nova sem allowlist entra `tier: free`
- [x] `/cadastro/…` com utm continua rastreando origem
- [x] `/cadastro` genérico **não** grava cookie de origem
- [x] Já logado em `/cadastro` → `/`
