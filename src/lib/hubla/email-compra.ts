// F127 — e-mail de acesso após a compra: uma vez por e-mail + chave.
//
// A linha em `purchase_email_send` é a reserva do envio: só quem criou a
// linha agora manda o e-mail. Aviso repetido da Hubla e mensalidade do PRO
// Mensal encontram a linha e não mandam de novo.
//
// Nada aqui pode derrubar o webhook: o acesso já foi liberado antes.

import { prisma } from "@/lib/db";
import { sendCompraEmail } from "@/lib/email";
import type { CompraEmail } from "@/lib/email/compra";
import type { PlanoPagoHubla } from "./produtos";

/** Teto do envio dentro do request (o webhook tem 20 s). */
export const TIMEOUT_EMAIL_COMPRA_MS = 5_000;

export function chaveCompraModulo(moduleId: string): string {
  return `modulo:${moduleId}`;
}

export function chaveCompraPlano(plan: PlanoPagoHubla): string {
  return `plano:${plan}`;
}

export const CHAVES_COMPRA_PLANO = [
  chaveCompraPlano("pro"),
  chaveCompraPlano("elite"),
] as const;

export type DepsAvisoCompra = {
  /** Cria a reserva. `false` = já existia (não envia). */
  reservar: (email: string, chave: string) => Promise<boolean>;
  enviar: (opts: { to: string; compra: CompraEmail }) => Promise<void>;
  registrar: (email: string, chave: string, erro: string | null) => Promise<void>;
  timeoutMs?: number;
};

async function reservarNoBanco(email: string, chave: string): Promise<boolean> {
  const { count } = await prisma.purchaseEmailSend.createMany({
    data: [{ email, chave }],
    skipDuplicates: true,
  });
  return count === 1;
}

async function registrarNoBanco(
  email: string,
  chave: string,
  erro: string | null,
): Promise<void> {
  await prisma.purchaseEmailSend.updateMany({
    where: { email, chave },
    data: erro ? { erro } : { sentAt: new Date(), erro: null },
  });
}

function comLimite<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`envio passou de ${ms} ms`)), ms);
  });
  return Promise.race([p, limite]).finally(() => clearTimeout(timer));
}

/**
 * Manda o e-mail de acesso para cada e-mail que ainda não recebeu por esta
 * chave. Nunca lança: falha vira `erro` na linha e log.
 */
export async function avisarCompra(
  emails: string[],
  chave: string,
  compra: CompraEmail,
  deps: DepsAvisoCompra = {
    reservar: reservarNoBanco,
    enviar: sendCompraEmail,
    registrar: registrarNoBanco,
  },
): Promise<{ enviados: string[] }> {
  const enviados: string[] = [];
  const timeoutMs = deps.timeoutMs ?? TIMEOUT_EMAIL_COMPRA_MS;

  for (const email of new Set(emails)) {
    try {
      if (!(await deps.reservar(email, chave))) continue;
      try {
        await comLimite(deps.enviar({ to: email, compra }), timeoutMs);
        enviados.push(email);
        await deps.registrar(email, chave, null);
      } catch (e) {
        const erro = e instanceof Error ? e.message : String(e);
        console.error("[hubla/email-compra] falha no envio", { chave }, e);
        await deps.registrar(email, chave, erro.slice(0, 500));
      }
    } catch (e) {
      console.error("[hubla/email-compra] falha ao reservar/registrar", { chave }, e);
    }
  }
  return { enviados };
}

/**
 * Reembolso ou remoção: esquece o envio, para a próxima compra avisar de novo.
 * Nunca lança.
 */
export async function esquecerAvisoCompra(
  emails: string[],
  chaves: readonly string[],
): Promise<void> {
  if (emails.length === 0 || chaves.length === 0) return;
  try {
    await prisma.purchaseEmailSend.deleteMany({
      where: { email: { in: emails }, chave: { in: [...chaves] } },
    });
  } catch (e) {
    console.error("[hubla/email-compra] falha ao esquecer envio", { chaves }, e);
  }
}
