/** Chave Resend da app Comunidade (envio API + listagem F085). */

export function resendApiKey(): string | null {
  const key =
    process.env.RESEND_API_KEY?.trim() ||
    process.env.RESEND_SMTP_PASS?.trim() ||
    "";
  return key || null;
}
