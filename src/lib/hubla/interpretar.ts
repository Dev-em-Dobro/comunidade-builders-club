import { emailDoEvento, productIdDoEvento } from "./normalizar";
import type { PlanoPagoHubla } from "./produtos";
import {
  EVENTOS_CONCEDER,
  EVENTOS_REVOGAR,
  type AcaoAllowlist,
  type HublaWebhookPayload,
} from "./tipos";

export function interpretarEventoHubla(
  payload: HublaWebhookPayload,
  productPlanMap?: Map<string, PlanoPagoHubla> | null,
): AcaoAllowlist {
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

  const plan = productPlanMap?.get(productId) ?? null;
  if (productPlanMap && productPlanMap.size > 0 && !plan) {
    return { acao: "ignorar", motivo: "produto não filtrado" };
  }

  const email = emailDoEvento(event);
  if (!email) {
    return { acao: "ignorar", motivo: "email ausente" };
  }

  if (EVENTOS_CONCEDER.has(tipo)) {
    const subStatus = event.subscription?.status?.toLowerCase();
    if (subStatus && subStatus !== "active") {
      return { acao: "ignorar", motivo: "subscription não active" };
    }
    return {
      acao: "conceder",
      email,
      productId,
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
