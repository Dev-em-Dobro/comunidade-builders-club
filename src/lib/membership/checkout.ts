// F053 — ofertas oficiais Hubla (PRO e Elite).

export const PROMESSA_PRIMEIRO_CLIENTE = "Feche o 1º cliente em 90 dias";

export const CHECKOUT_PRO_FALLBACK_URL =
  "https://pay.hub.la/XaY8QNfZlOO1XBgjzMfY";
export const CHECKOUT_ELITE_FALLBACK_URL =
  "https://pay.hub.la/v1SsMcVXNip7Mn5A2pNH";

export type OfferId = "pro" | "elite";

export type BoletoCheckout = {
  label: string;
  url: string;
};

export type ClubOffer = {
  id: OfferId;
  name: string;
  priceLabel: string;
  installments: string;
  extraPriceNote?: string;
  promise: string;
  highlights: string[];
  checkoutUrl: string;
  boletoCheckouts?: BoletoCheckout[];
  recommended?: boolean;
};

export const CHECKOUT_ELITE_BOLETO_URLS = [
  "https://pay.tmb.com.br/DevemDobro/9DW254247E5",
  "https://pay.tmb.com.br/DevemDobro/3XB272209KV",
] as const;

function envUrl(name: string): string | null {
  const v = process.env[name]?.trim();
  return v || null;
}

export function checkoutUrlPro(): string {
  return envUrl("HUBLA_CHECKOUT_URL_PRO") || CHECKOUT_PRO_FALLBACK_URL;
}

export function checkoutUrlElite(): string {
  return envUrl("HUBLA_CHECKOUT_URL_ELITE") || CHECKOUT_ELITE_FALLBACK_URL;
}

/** @deprecated F041 — use checkoutUrlPro / checkoutUrlElite. */
export function checkoutUrlBuildersClub(): string {
  return checkoutUrlPro();
}

export function ofertaPro(): ClubOffer {
  return {
    id: "pro",
    name: "PRO",
    priceLabel: "R$ 297",
    installments: "ou 6x de R$ 55,18",
    promise: PROMESSA_PRIMEIRO_CLIENTE,
    highlights: [
      "Aulas gravadas",
      "Skills",
      "Templates",
      "Ingresso pro evento",
      "Comunidade (spaces, posts e interações)",
    ],
    checkoutUrl: checkoutUrlPro(),
  };
}

export function ofertaElite(): ClubOffer {
  return {
    id: "elite",
    name: "Elite",
    priceLabel: "R$ 997",
    installments: "ou 12x de R$ 101,30",
    extraPriceNote: "Boleto em R$ 1.297",
    promise: PROMESSA_PRIMEIRO_CLIENTE,
    highlights: [
      "Tudo do PRO",
      "Acesso ao Orion",
      "1 reunião semanal em grupo",
      "+ Skills",
      "+ Templates",
    ],
    checkoutUrl: checkoutUrlElite(),
    boletoCheckouts: [
      {
        label: "Boleto — oferta 1",
        url:
          envUrl("TMB_CHECKOUT_ELITE_BOLETO_1") ||
          CHECKOUT_ELITE_BOLETO_URLS[0],
      },
      {
        label: "Boleto — oferta 2",
        url:
          envUrl("TMB_CHECKOUT_ELITE_BOLETO_2") ||
          CHECKOUT_ELITE_BOLETO_URLS[1],
      },
    ],
    recommended: true,
  };
}

export function ofertasBuildersClub(): { pro: ClubOffer; elite: ClubOffer } {
  return { pro: ofertaPro(), elite: ofertaElite() };
}

export function urlOrionApp(): string {
  return (
    process.env.ORION_APP_URL?.trim() ||
    "https://orion-lead-hunter.devemdobro.com"
  );
}
