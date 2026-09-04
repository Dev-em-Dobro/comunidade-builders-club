# ADR-010 — Microsoft Clarity (mapa de calor)

## Status
Aceito — 2026-08-31

## Contexto
Precisamos ver cliques, scroll e sessões na comunidade. O F057 já
reservou o portão de consentimento e proibiu subir pixel antes.

## Decisão
Microsoft Clarity via **snippet oficial** (`next/script`,
`afterInteractive`). Project ID em `NEXT_PUBLIC_CLARITY_PROJECT_ID`
(público). Um projeto Clarity por ambiente (staging ≠ produção).

Não entra `@microsoft/clarity` no npm. O script **só é injetado** se
`consentiuAnalytics()` for true (F057). Não usamos o modo “carregar e
depois consentv2”: o silêncio não pode ter disparado tracking.

## Alternativas
- Hotjar / PostHog: lib extra ou custo; Clarity já cabe na conta Ferramentas.
- NPM `@microsoft/clarity`: mesma rede, mais dependência. Recusado.

## Consequências
Microsoft passa a ser subprocessador de medição (Política). Gravações
mascaram input por padrão; reforçamos mask no login/OTP. Dashboard em
clarity.microsoft.com, não no admin do Club.
