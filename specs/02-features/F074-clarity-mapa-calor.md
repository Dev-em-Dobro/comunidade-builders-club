# F074 — Mapa de calor (Microsoft Clarity)

## Status
Em implementação — 2026-08-31

Depende de: [F057](F057-cookies-consentimento.md) (portão `consentiuAnalytics`),
[ADR-010](../04-decisions/ADR-010-microsoft-clarity.md).

## Objetivo

Ver **onde a comunidade é usada**: cliques, scroll, gravação de sessão.
Sem isso, UX é chute. O F057 já deixou o portão pronto e pediu o pixel
numa feature própria — esta é ela.

## Por que Clarity

Gratuito, heatmap + session replay, conta Microsoft (Ferramentas). Sem
SDK no `package.json`: snippet oficial via `next/script`. Alternativas
(Hotjar, PostHog) ou `@microsoft/clarity` no npm ficam de fora.

## O que vocês fazem na conta Ferramentas

1. Entrar em [clarity.microsoft.com](https://clarity.microsoft.com) com a
   conta Microsoft **Ferramentas**.
2. **Add new project**:
   - Nome: `Builders Club staging`
   - URL: `https://hml-comunidade-builders-club.devemdobro.com`
3. Copiar o **Project ID** (Settings → Overview). É público (vai no
   browser). Não é senha.
4. Colar na Vercel → Preview: `NEXT_PUBLIC_CLARITY_PROJECT_ID`.
5. **Produção:** projeto separado (`comunidade-builders-club.devemdobro.com`) e o
   ID só no Environment Production — **depois** do merge em `main`. Não
   misturar heatmap de HML com o de alunos reais.
6. No projeto: Advanced settings → **mask** no padrão (inputs, e-mail e
   números já nascem mascarados). Não ligar “unmask” em formulário de
   login/OTP.

Dados no dashboard demoram um pouco (minutos a algumas horas) depois do
primeiro aceite + navegação.

## Comportamento no app

- Sem `NEXT_PUBLIC_CLARITY_PROJECT_ID` → não carrega nada (local ok).
- Sem aceite no banner F057 → **não injeta o script**. Silêncio ≠ aceite.
- Aceite no banner (já gravado ou agora) → injeta o snippet
  `afterInteractive`.
- Não envia e-mail nem nome para o Clarity (`identify` fora de escopo).
- Login e cadastro (e-mail/OTP) com `data-clarity-mask`.
- Recusar não quebra login.

## Fora de escopo

- npm `@microsoft/clarity`
- Identify / tags por space ou plano
- Clarity em localhost (só se alguém colocar o ID no `.env` local)
- Produção neste PR (env de Production vazia até pedido)

## Critérios

- [x] Spec + ADR-010
- [x] Script só com Project ID **e** `consentiuAnalytics`
- [x] Aceitar no banner carrega sem reload
- [x] Recusar / sem decisão: nenhum `clarity.ms`
- [x] Política nomeia Clarity e o cookie de medição
- [x] Formulários de login/cadastro mascarados
