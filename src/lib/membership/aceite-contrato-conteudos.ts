/**
 * F122 — aceite do Contrato de Conteúdos Digitais.
 */

import type { Membership, MembershipTier } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  DOCUMENTO_CONTRATO_CONTEUDOS,
  VERSAO_CONTRATO_CONTEUDOS,
  compraExigeContratoConteudos,
} from "@/lib/legal/contrato-conteudos";
import type { ContextoAceite } from "./aceite-legal";

const TIERS_PAGOS_COMPRA = new Set<MembershipTier>(["paid", "pro", "elite"]);

export function membershipPagoPorCompra(
  m: Pick<Membership, "tier" | "status">,
): boolean {
  return m.status === "active" && TIERS_PAGOS_COMPRA.has(m.tier);
}

export async function temAceiteContratoConteudosVigente(
  userId: string,
): Promise<boolean> {
  const row = await prisma.legalAcceptance.findUnique({
    where: {
      userId_documento_versao: {
        userId,
        documento: DOCUMENTO_CONTRATO_CONTEUDOS,
        versao: VERSAO_CONTRATO_CONTEUDOS,
      },
    },
    select: { id: true },
  });
  return Boolean(row);
}

/**
 * Data de conversão paga: membership primeiro; allowlist como fallback.
 * Sem data → null (não inventar).
 */
export async function dataConversaoPagaDoMembro(opts: {
  userId: string;
  email: string;
  convertedToPaidAt: Date | null;
}): Promise<Date | null> {
  if (opts.convertedToPaidAt) return opts.convertedToPaidAt;
  const allow = await prisma.allowedEmail.findFirst({
    where: { email: { equals: opts.email, mode: "insensitive" } },
    select: { paidAt: true },
  });
  return allow?.paidAt ?? null;
}

export async function precisaAceiteContratoConteudos(opts: {
  userId: string;
  email: string;
  membership: Pick<Membership, "tier" | "status" | "convertedToPaidAt">;
}): Promise<boolean> {
  if (!membershipPagoPorCompra(opts.membership)) return false;
  if (await temAceiteContratoConteudosVigente(opts.userId)) return false;
  const data = await dataConversaoPagaDoMembro({
    userId: opts.userId,
    email: opts.email,
    convertedToPaidAt: opts.membership.convertedToPaidAt,
  });
  return compraExigeContratoConteudos(data);
}

export async function registrarAceiteContratoConteudos(
  userId: string,
  contexto: ContextoAceite = {},
): Promise<void> {
  await prisma.legalAcceptance.createMany({
    data: [
      {
        userId,
        documento: DOCUMENTO_CONTRATO_CONTEUDOS,
        versao: VERSAO_CONTRATO_CONTEUDOS,
        ip: contexto.ip ?? null,
        userAgent: contexto.userAgent ?? null,
      },
    ],
    skipDuplicates: true,
  });
}
