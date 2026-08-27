// Tipos do webhook Hubla v2 (F014 / ADR-006).

import type { PlanoPagoHubla } from "./produtos";

export type HublaWebhookOffer = {
  id?: string;
  name?: string;
  isOrderBump?: boolean;
};

export type HublaWebhookProduct = {
  id?: string;
  name?: string;
  offers?: HublaWebhookOffer[];
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
  };
  invoice?: {
    status?: string;
    payer?: { email?: string };
    user?: { email?: string };
  };
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
    }
  | { acao: "revogar"; email: string; productId: string }
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
