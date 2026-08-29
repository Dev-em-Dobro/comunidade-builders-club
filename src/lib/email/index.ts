import nodemailer from "nodemailer";
import { requireAuthEnv } from "@/lib/auth/env";
import { NOME_PRODUTO } from "@/lib/produto";

type EmailProvider = "mailpit" | "resend";

function getProvider(): EmailProvider {
  const raw = requireAuthEnv("EMAIL_PROVIDER");
  if (raw === "mailpit" || raw === "resend") return raw;
  throw new Error(
    `[email] EMAIL_PROVIDER inválido: "${raw}". Use "mailpit" ou "resend".`,
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const provider = getProvider();

  if (provider === "mailpit") {
    const base = process.env.MAILPIT_URL?.trim() || "http://127.0.0.1:8025";
    const from = process.env.EMAIL_FROM?.trim() || NOME_PRODUTO;
    const res = await fetch(`${base.replace(/\/$/, "")}/api/v1/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        From: { Email: "noreply@localhost", Name: from },
        To: [{ Email: opts.to }],
        Subject: opts.subject,
        Text: opts.text,
        HTML: opts.html,
      }),
    });
    if (!res.ok) {
      throw new Error(`[email] Mailpit falhou: ${res.status} ${await res.text()}`);
    }
    return;
  }

  const transporter = nodemailer.createTransport({
    host: requireAuthEnv("RESEND_SMTP_HOST"),
    port: Number(requireAuthEnv("RESEND_SMTP_PORT")),
    secure: true,
    auth: {
      user: requireAuthEnv("RESEND_SMTP_USER"),
      pass: requireAuthEnv("RESEND_SMTP_PASS"),
    },
  });

  await transporter.sendMail({
    from: requireAuthEnv("RESEND_SMTP_FROM_EMAIL"),
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}

function wrapHtml(title: string, inner: string): string {
  return `<!DOCTYPE html><html lang="pt-BR"><body style="font-family:sans-serif;background:#f4f7f6;padding:32px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e2e8e6;">
    <p style="color:#0d9488;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;font-size:12px;margin:0 0 12px;">${escapeHtml(NOME_PRODUTO)}</p>
    <h1 style="font-size:20px;margin:0 0 12px;color:#0f172a;">${escapeHtml(title)}</h1>
    ${inner}
  </div></body></html>`;
}

export async function sendMagicLinkEmail(opts: {
  to: string;
  url: string;
}): Promise<void> {
  const subject = `Seu link de acesso — ${NOME_PRODUTO}`;
  const text = [
    `Olá,`,
    ``,
    `Use o link abaixo para entrar no ${NOME_PRODUTO}:`,
    ``,
    opts.url,
    ``,
    `Se você não pediu este acesso, ignore este e-mail.`,
    ``,
    `— ${NOME_PRODUTO}`,
  ].join("\n");
  const html = wrapHtml(
    "Seu link de acesso",
    `<p style="color:#64748b;font-size:15px;line-height:1.5;">O link vale por poucos minutos.</p>
    <p style="margin:24px 0;"><a href="${escapeHtml(opts.url)}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;">Entrar</a></p>`,
  );
  await sendMail({ to: opts.to, subject, text, html });
}

export async function sendOtpEmail(opts: { to: string; otp: string }): Promise<void> {
  const subject = `Seu código de acesso — ${NOME_PRODUTO}`;
  /**
   * F067 — sai a instrução de olhar spam (a pessoa está lendo o e-mail) e
   * entra o que espera do outro lado do código. Serve para free e para
   * quem já é pago, que tem isso e mais.
   */
  const text = [
    `Olá,`,
    ``,
    `Seu código para entrar no ${NOME_PRODUTO} é:`,
    ``,
    opts.otp,
    ``,
    `O código vale por 10 minutos.`,
    ``,
    `Do outro lado dele: as primeiras aulas da formação, o feed com o que a`,
    `comunidade está fechando — cliente, preço e como foi — e os presentes`,
    `liberados.`,
    ``,
    `Se você não pediu este acesso, ignore este e-mail.`,
    ``,
    `— ${NOME_PRODUTO}`,
  ].join("\n");
  const html = wrapHtml(
    "Seu código de acesso",
    `<p style="color:#64748b;font-size:15px;line-height:1.5;">Digite o código na tela em que você parou. Vale por 10 minutos.</p>
    <p style="margin:24px 0;font-size:32px;letter-spacing:0.28em;font-weight:700;color:#0f172a;text-align:center;">${escapeHtml(opts.otp)}</p>
    <p style="color:#64748b;font-size:14px;line-height:1.6;">Do outro lado dele: as primeiras aulas da formação, o feed com o que a comunidade está fechando — cliente, preço e como foi — e os presentes liberados.</p>`,
  );
  await sendMail({ to: opts.to, subject, text, html });
}
