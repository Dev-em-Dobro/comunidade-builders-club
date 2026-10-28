/**
 * F122 — aceite do Contrato de Conteúdos Digitais.
 *
 * F120: Vitalício (Black Infinita) é `tier=elite` + `vitalicio=true`. Quem
 * já era PRO/Elite e só depois virou vitalício tem `convertedToPaidAt`
 * antigo — aí a data que conta para o corte é `vitalicioGrantedAt`.
 */

import type { Membership, MembershipTier } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  DOCUMENTO_CONTRATO_CONTEUDOS,
  VERSAO_CONTRATO_CONTEUDOS,
  compraExigeContratoConteudos,
  dataEfetivaCompraContrato,
} from "@/lib/legal/contrato-conteudos";
import type { ContextoAceite } from "./aceite-legal";

const TIERS_PAGOS_COMPRA = new Set<MembershipTier>(["paid", "pro", "elite"]);

/** Pago por compra: tier pago **ou** flag vitalício (F120). */
export function membershipPagoPorCompra(
  m: Pick<Membership, "tier" | "status" | "vitalicio">,
): boolean {
  if (m.status !== "active") return false;
  if (m.vitalicio) return true;
  return TIERS_PAGOS_COMPRA.has(m.tier);
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
 * Datas candidatas: conversão paga, allowlist, e (F120) grant vitalício.
 * Sem data → null (não inventar).
 */
export async function dataConversaoPagaDoMembro(opts: {
  userId: string;
  email: string;
  convertedToPaidAt: Date | null;
  vitalicioGrantedAt?: Date | null;
}): Promise<Date | null> {
  const allow = await prisma.allowedEmail.findFirst({
    where: { email: { equals: opts.email, mode: "insensitive" } },
    select: { paidAt: true },
  });
  return dataEfetivaCompraContrato([
    opts.convertedToPaidAt,
    allow?.paidAt,
    opts.vitalicioGrantedAt,
  ]);
}

export async function precisaAceiteContratoConteudos(opts: {
  userId: string;
  email: string;
  membership: Pick<
    Membership,
    "tier" | "status" | "convertedToPaidAt" | "vitalicio" | "vitalicioGrantedAt"
  >;
}): Promise<boolean> {
  if (!membershipPagoPorCompra(opts.membership)) return false;
  if (await temAceiteContratoConteudosVigente(opts.userId)) return false;
  const data = await dataConversaoPagaDoMembro({
    userId: opts.userId,
    email: opts.email,
    convertedToPaidAt: opts.membership.convertedToPaidAt,
    vitalicioGrantedAt: opts.membership.vitalicioGrantedAt,
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
