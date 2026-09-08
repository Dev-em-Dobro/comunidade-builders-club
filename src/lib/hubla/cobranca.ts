// F081 — extrai valor/moeda/data do payload Hubla sem bloquear acesso.

import type {
  CobrancaHubla,
  HublaCobrancaCampos,
  HublaWebhookOffer,
  HublaWebhookPayload,
} from "./tipos";

const SEM_COBRANCA: CobrancaHubla = {
  valorCentavos: null,
  moeda: null,
  cobradoEm: null,
};

function lerNumero(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.replace(",", "."));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Hubla / gateways BR costumam mandar centavos (inteiro) ou reais (decimal).
 * Inteiro → centavos; decimal → reais × 100. Nunca devolve float.
 */
export function paraCentavos(valor: number): number {
  if (!Number.isFinite(valor) || valor < 0) return 0;
  if (Number.isInteger(valor)) return valor;
  return Math.round(valor * 100);
}

function valorDeCampos(campos: HublaCobrancaCampos | HublaWebhookOffer | undefined): number | null {
  if (!campos) return null;
  const bruto =
    lerNumero(campos.amountInCents) ??
    lerNumero("amount" in campos ? campos.amount : undefined) ??
    lerNumero("totalAmount" in campos ? campos.totalAmount : undefined) ??
    lerNumero("total" in campos ? campos.total : undefined) ??
    lerNumero("value" in campos ? campos.value : undefined) ??
    lerNumero(campos.price);
  if (bruto === null) return null;
  return paraCentavos(bruto);
}

function moedaDeCampos(campos: HublaCobrancaCampos | undefined): string | null {
  if (!campos) return null;
  const raw = campos.currencyCode ?? campos.currency;
  if (typeof raw !== "string") return null;
  const m = raw.trim().toUpperCase();
  return m || null;
}

function dataDeCampos(campos: HublaCobrancaCampos | undefined): Date | null {
  if (!campos) return null;
  const raw = campos.paidAt ?? campos.billingDate ?? campos.createdAt;
  if (typeof raw !== "string" || !raw.trim()) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function primeiraOferta(
  payload: HublaWebhookPayload,
): HublaWebhookOffer | undefined {
  const event = payload.event;
  if (!event) return undefined;
  const products = [
    ...(event.products ?? []),
    ...(event.product ? [event.product] : []),
  ];
  for (const p of products) {
    const offer = p.offers?.[0];
    if (offer) return offer;
  }
  return undefined;
}

/** Lê cobrança do evento. Qualquer falha → nulls (acesso segue). */
export function extrairCobrancaHubla(payload: HublaWebhookPayload): CobrancaHubla {
  try {
    const event = payload.event;
    if (!event) return SEM_COBRANCA;

    const fontes: Array<HublaCobrancaCampos | HublaWebhookOffer | undefined> = [
      event.invoice,
      event.payment,
      event.subscription,
      event.product
        ? {
            amount: event.product.amount,
            price: event.product.price,
          }
        : undefined,
      primeiraOferta(payload),
    ];

    let valorCentavos: number | null = null;
    let moeda: string | null = null;
    let cobradoEm: Date | null = null;

    for (const fonte of fontes) {
      if (valorCentavos === null) {
        const v = valorDeCampos(fonte);
        if (v !== null) valorCentavos = v;
      }
      if (!moeda && fonte && "currency" in fonte) {
        moeda = moedaDeCampos(fonte as HublaCobrancaCampos);
      }
      if (!cobradoEm && fonte && ("paidAt" in fonte || "billingDate" in fonte || "createdAt" in fonte)) {
        cobradoEm = dataDeCampos(fonte as HublaCobrancaCampos);
      }
    }

    if (valorCentavos !== null && !moeda) moeda = "BRL";

    return { valorCentavos, moeda, cobradoEm };
  } catch {
    return SEM_COBRANCA;
  }
}
