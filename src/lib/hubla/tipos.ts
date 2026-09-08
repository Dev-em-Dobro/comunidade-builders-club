// Tipos do webhook Hubla v2 (F014 / ADR-006 / F081).

import type { PlanoPagoHubla } from "./produtos";

export type HublaWebhookOffer = {
  id?: string;
  name?: string;
  isOrderBump?: boolean;
  /** F081 — preço pode vir na oferta (centavos ou reais). */
  price?: number;
  amount?: number;
  amountInCents?: number;
};

export type HublaWebhookProduct = {
  id?: string;
  name?: string;
  offers?: HublaWebhookOffer[];
  price?: number;
  amount?: number;
};

export type HublaCobrancaCampos = {
  status?: string;
  amount?: number;
  amountInCents?: number;
  total?: number;
  totalAmount?: number;
  value?: number;
  price?: number;
  currency?: string;
  currencyCode?: string;
  paidAt?: string;
  createdAt?: string;
  billingDate?: string;
};

export type HublaWebhookPayload = {
  type?: string;
  version?: string;
  event?: HublaWebhookEvent;
};

export type HublaWebhookEvent = {
  product?: HublaWebhookProduct;
  products?: HublaWebhookProduct[];
  user?: {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  subscription?: {
    id?: string;
    status?: string;
    type?: string;
    payer?: { email?: string; id?: string };
  } & HublaCobrancaCampos;
  invoice?: {
    payer?: { email?: string };
    user?: { email?: string };
  } & HublaCobrancaCampos;
  /** F081 — alguns eventos trazem pagamento separado. */
  payment?: HublaCobrancaCampos;
};

/** F081 — cobrança extraída do payload (nulls ok; nunca bloqueia acesso). */
export type CobrancaHubla = {
  valorCentavos: number | null;
  moeda: string | null;
  cobradoEm: Date | null;
};

export type AcaoAllowlist =
  | {
      acao: "conceder";
      email: string;
      emails: string[];
      productId: string;
      offerId?: string;
      plan: PlanoPagoHubla;
      hublaUserId?: string;
      subscriptionId?: string;
      cobranca: CobrancaHubla;
    }
  | { acao: "revogar"; email: string; productId: string; cobranca: CobrancaHubla }
  | { acao: "ignorar"; motivo: string };

export const EVENTOS_CONCEDER = new Set([
  "customer.member_added",
  "invoice.payment_succeeded",
  "subscription.activated",
]);
export const EVENTOS_REVOGAR = new Set([
  "customer.member_removed",
  "invoice.refunded",
]);

/** Assinatura que não deve conceder acesso. Sem status ou `completed` passa. */
export const STATUS_ASSINATURA_BLOQUEADOS = new Set([
  "canceled",
  "cancelled",
  "unpaid",
  "refunded",
  "past_due",
  "expired",
]);
