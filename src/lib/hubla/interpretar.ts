import { emailDoEvento, emailsDoEvento, offerIdsDoEvento, productIdDoEvento } from "./normalizar";
import { planoDoEventoHubla, type PlanoPagoHubla } from "./produtos";
import {
  EVENTOS_CONCEDER,
  EVENTOS_REVOGAR,
  STATUS_ASSINATURA_BLOQUEADOS,
  type AcaoAllowlist,
  type HublaWebhookPayload,
} from "./tipos";

export type FiltroHubla = {
  productPlanMap?: Map<string, PlanoPagoHubla> | null;
  offerPlanMap?: Map<string, PlanoPagoHubla> | null;
};

export function interpretarEventoHubla(
  payload: HublaWebhookPayload,
  filtro?: Map<string, PlanoPagoHubla> | null | FiltroHubla,
): AcaoAllowlist {
  const productPlanMap =
    filtro && typeof filtro === "object" && "productPlanMap" in filtro
      ? filtro.productPlanMap
      : (filtro as Map<string, PlanoPagoHubla> | null | undefined);
  const offerPlanMap =
    filtro && typeof filtro === "object" && "offerPlanMap" in filtro
      ? (filtro.offerPlanMap ?? new Map())
      : new Map<string, PlanoPagoHubla>();

  const tipo = payload.type?.trim();
  if (!tipo) {
    return { acao: "ignorar", motivo: "tipo ausente" };
  }

  const event = payload.event;
  if (!event) {
    return { acao: "ignorar", motivo: "event ausente" };
  }

  const productId = productIdDoEvento(event);
  if (!productId) {
    return { acao: "ignorar", motivo: "product_id ausente" };
  }

  const offerIds = offerIdsDoEvento(event);
  const plan =
    productPlanMap || offerPlanMap.size > 0
      ? planoDoEventoHubla({
          productId,
          offerIds,
          productMap: productPlanMap ?? new Map(),
          offerMap: offerPlanMap,
        })
      : "pro";

  if ((productPlanMap && productPlanMap.size > 0) || offerPlanMap.size > 0) {
    if (!plan) {
      return { acao: "ignorar", motivo: "produto ou oferta não filtrados" };
    }
  }

  const emails = emailsDoEvento(event);
  const email = emails[0] ?? emailDoEvento(event);
  if (!email) {
    return { acao: "ignorar", motivo: "email ausente" };
  }

  if (EVENTOS_CONCEDER.has(tipo)) {
    const subStatus = event.subscription?.status?.toLowerCase();
    if (subStatus && STATUS_ASSINATURA_BLOQUEADOS.has(subStatus)) {
      return { acao: "ignorar", motivo: "subscription não paga" };
    }
    const offerId = offerIds.find((id) => offerPlanMap.get(id) === plan) ?? offerIds[0];
    return {
      acao: "conceder",
      email,
      emails,
      productId,
      ...(offerId ? { offerId } : {}),
      plan: plan ?? "pro",
      hublaUserId: event.user?.id,
      subscriptionId: event.subscription?.id,
    };
  }

  if (EVENTOS_REVOGAR.has(tipo)) {
    return { acao: "revogar", email, productId };
  }

  return { acao: "ignorar", motivo: `tipo não tratado: ${tipo}` };
}
