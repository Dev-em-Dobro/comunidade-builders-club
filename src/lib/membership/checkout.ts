// F053 — ofertas oficiais Hubla (PRO e Elite).

export const PROMESSA_PRIMEIRO_CLIENTE = "Feche o 1º cliente em 90 dias";

export const CHECKOUT_PRO_FALLBACK_URL =
  "https://pay.hub.la/XaY8QNfZlOO1XBgjzMfY";
export const CHECKOUT_ELITE_FALLBACK_URL =
  "https://pay.hub.la/v1SsMcVXNip7Mn5A2pNH";

export type OfferId = "pro" | "elite";

export type OfferHighlight = {
  title: string;
  detail: string;
};

export type BoletoCheckout = {
  label: string;
  url: string;
};

/**
 * Preço da oferta com a parcela separada do à vista: o card destaca o
 * parcelado (`installments`x de `installmentPrice`) e deixa o à vista como
 * linha secundária. O parcelado tem acréscimo — não anunciar "sem juros".
 */
export type OfferPricing = {
  installments: number;
  installmentPrice: string;
  fullPrice: string;
  boletoPrice?: string;
};

export type ClubOffer = {
  id: OfferId;
  name: string;
  pricing: OfferPricing;
  paymentHint?: string;
  promise: string;
  highlights: OfferHighlight[];
  checkoutUrl: string;
  boletoCheckouts?: BoletoCheckout[];
  recommended?: boolean;
};

/** Checkout de boleto Elite na página de planos. */
export const CHECKOUT_ELITE_BOLETO_URL =
  "https://pay.tmb.com.br/DevemDobro/9DW254247E5";

/** Codes TMB que o webhook ainda reconhece como Elite (o 2º não é CTA). */
export const CHECKOUT_ELITE_BOLETO_URLS = [
  CHECKOUT_ELITE_BOLETO_URL,
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
    pricing: {
      installments: 6,
      installmentPrice: "R$ 55,18",
      fullPrice: "R$ 297",
    },
    paymentHint: "Pagamento em cartão ou Pix",
    promise: PROMESSA_PRIMEIRO_CLIENTE,
    highlights: [
      {
        title: "Aulas gravadas",
        detail: "Formação completa para assistir no seu ritmo e marcar progresso",
      },
      {
        title: "Skills",
        detail: "Pacotes prontos para o atendimento e a entrega do cliente",
      },
      {
        title: "Templates",
        detail: "Proposta, contrato e materiais para fechar e executar",
      },
      {
        title: "Ingresso da Imersão 2 a 5k com IA",
        detail: "Acesso ao próximo evento online da Imersão",
      },
      {
        title: "Orion (plano Free)",
        detail: "Motor de prospecção para encontrar e priorizar leads locais",
      },
      {
        title: "Comunidade",
        detail: "Spaces, posts e networking com outros builders",
      },
    ],
    checkoutUrl: checkoutUrlPro(),
  };
}

export function ofertaElite(): ClubOffer {
  return {
    id: "elite",
    name: "Elite",
    pricing: {
      installments: 12,
      installmentPrice: "R$ 101,30",
      fullPrice: "R$ 997",
      boletoPrice: "R$ 1.297",
    },
    promise: PROMESSA_PRIMEIRO_CLIENTE,
    highlights: [
      {
        title: "Tudo do PRO",
        detail: "Aulas, comunidade, skills, templates e ingresso da Imersão",
      },
      {
        title: "Acesso ao Orion (plano PRO por 90 dias)",
        detail: "Motor de prospecção com limites bem acima do plano Free",
      },
      {
        title: "Reunião semanal em grupo",
        detail: "Encontro ao vivo para tirar dúvida e avançar o comercial",
      },
      {
        title: "Skills extras",
        detail: "Biblioteca ampliada do plano Elite",
      },
      {
        title: "Templates extras",
        detail: "Mais modelos para operação e comercial",
      },
    ],
    checkoutUrl: checkoutUrlElite(),
    boletoCheckouts: [
      {
        label: "Opção para boleto",
        url: envUrl("TMB_CHECKOUT_ELITE_BOLETO_1") || CHECKOUT_ELITE_BOLETO_URL,
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
