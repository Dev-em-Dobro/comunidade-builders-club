# ADR-009 — Código OTP por e-mail

## Status
Em implementação — 2026-08-25 · complementa ADR-003

## Contexto
F059 abre a leitura pública dos **Presentes**. O link chega por automação de DM
do Instagram, então a página abre no **navegador interno do Instagram** (webview).
Os dois métodos de ADR-003 falham nesse contexto:

- **Google OAuth** — o Google recusa webview (`disallowed_useragent`). É política
  do provedor, não contornável do nosso lado.
- **Magic link** — a conta só nasce quando a pessoa abre o e-mail, que acontece
  em **outro navegador**. O cookie de atribuição de F059 ficou no webview, então
  `databaseHooks.user.create.after` roda sem origem para ler. Perde a atribuição
  **inclusive de quem volta** — que é justamente o que F059 existe para proteger.

E-mail/senha resolveria, mas ADR-003 já rejeitou pela superfície envolvida
(hash, reset, rate limit), e o custo continua o mesmo hoje.

## Decisão
Habilitar o plugin **`email-otp`** do Better Auth como método de cadastro/login,
ao lado de Google OAuth e magic link.

Código de 6 dígitos enviado por e-mail e digitado **na mesma aba** que já está
aberta. A conta nasce no POST da verificação — mesmo navegador, com o cookie de
origem presente.

Versão instalada: Better Auth 1.6.25 (`package.json` pede `^1.6.23`). Plugin já
disponível, sem dependência nova.

Configuração:

| Opção | Valor | Motivo |
|-------|-------|--------|
| `disableSignUp` | `false` (default) | e-mail novo vira cadastro; e-mail existente loga. Um endpoint para os dois casos. |
| `allowedAttempts` | `3` (default) | brute force no código já barrado pelo plugin |
| `otpLength` | `6` (default) | — |
| `expiresIn` | a definir na implementação | curto, mas maior que o tempo de trocar de app e voltar |

Magic link e Google **permanecem** em `/login` para os membros atuais. Nada é
removido.

## Alternativas
- **E-mail/senha** — melhor experiência (não sai do app em momento nenhum), mas
  reverte ADR-003 e traz reset, hash, força mínima e convivência com Google.
  Bagagem demais para o prazo.
- **Só magic link** — custo zero, mas perde a atribuição por post e é o maior
  ponto de abandono do funil. Contraria o objetivo de F059.
- **Manter só Google** — inviável no webview do Instagram.

## Consequências
- Mantém o **sem senha** de ADR-003: sem hash, sem fluxo de reset, sem a
  superfície que motivou a rejeição original.
- Depende do e-mail transacional (ADR-004), como o magic link. **Diferença
  importante:** no magic link a pessoa sai e volta quando quiser; no OTP ela
  fica **parada na tela esperando**. Latência de entrega e caixa de spam passam
  a ser fator de conversão, não detalhe operacional — ver F059.
- O plugin cria o usuário apenas com e-mail. Nome e sobrenome são coletados no
  formulário e gravados em `Profile.displayName` depois da sessão existir (F059).
- `accountLinking` (`src/lib/auth/index.ts:41-48`) hoje tem
  `trustedProviders: ["google"]` e `allowDifferentEmails: false`. A convivência
  OTP + Google no mesmo e-mail precisa ser verificada antes de ligar em produção.
- F054 (tentativas de login recusadas) precisa decidir se o envio de OTP também
  registra, senão o cadastro via Presentes fica invisível nesse relatório.
