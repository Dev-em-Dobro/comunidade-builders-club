# ADR-004 — E-mail transacional (Resend / Mailpit)

## Status
Aceito — 2026-07-31

## Contexto
Magic link exige envio de e-mail.

## Decisão
- Produção: Resend via SMTP (`nodemailer`) + envs `RESEND_SMTP_*`.
- Dev: Mailpit (`EMAIL_PROVIDER=mailpit`).
Isolado em `src/lib/email/`.

## Alternativas
SDK Resend HTTP — preferimos SMTP alinhado ao Orion.

## Consequências
Dependência de deliverability; Mailpit para QA local.

F073 usa o mesmo canal para **e-mail agrupado de resposta** (comentário /
resposta / menção; nunca reação). Continua transacional: a pessoa publicou
ou comentou. Um e-mail por evento foi rejeitado de propósito — queima
reputação do domínio que entrega OTP e magic link.

F075 usa o mesmo canal para **e-mail da régua** (48h sem abrir o Club).
Também transacional, um por episódio de ausência, opt-out próprio. Não é
newsletter.
