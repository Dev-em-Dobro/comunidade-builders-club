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
