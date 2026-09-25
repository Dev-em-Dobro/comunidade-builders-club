// F053 / F090 — ofertas oficiais Hubla (PRO e Elite).

import {
  PROMESSA_ELITE,
  PROMESSA_PRO,
} from "@/lib/legal/garantia";

/** Meta de marketing (Presentes / upgrade). Não é garantia de reembolso do Pro. */
export const PROMESSA_PRIMEIRO_CLIENTE = "Feche o 1º cliente em 90 dias";

/** Slug de checkout Hubla = `offers[].id` no webhook (F053). */
export const HUBLA_OFFER_ID_PRO_OFICIAL = "XaY8QNfZlOO1XBgjzMfY";
/** PRO Europa (€50) — checkout próprio, não aparece em `/planos`. */
export const HUBLA_OFFER_ID_PRO_EUROPA = "1mGgy9MVD11CJdnsLEov";
/** Checkout público Elite em `/planos`. */
export const HUBLA_OFFER_ID_ELITE_OFICIAL = "v1SsMcVXNip7Mn5A2pNH";
/** Elite para alunos (checkout próprio, não aparece em `/planos`). */
export const HUBLA_OFFER_ID_ELITE_ALUNOS = "SFykfBk80jkM1sAVJKxV";
/** Elite Europa (€60) — checkout próprio, não aparece em `/planos`. */
export const HUBLA_OFFER_ID_ELITE_EUROPA = "cXqc4mz6YZFE4GKjGFUz";
export const HUBLA_OFFER_IDS_PRO_OFICIAIS = [
  HUBLA_OFFER_ID_PRO_OFICIAL,
  HUBLA_OFFER_ID_PRO_EUROPA,
] as const;
export const HUBLA_OFFER_IDS_ELITE_OFICIAIS = [
  HUBLA_OFFER_ID_ELITE_OFICIAL,
  HUBLA_OFFER_ID_ELITE_ALUNOS,
  HUBLA_OFFER_ID_ELITE_EUROPA,
] as const;

export const CHECKOUT_PRO_FALLBACK_URL =
  `https://pay.hub.la/${HUBLA_OFFER_ID_PRO_OFICIAL}`;
export const CHECKOUT_ELITE_FALLBACK_URL =
  `https://pay.hub.la/${HUBLA_OFFER_ID_ELITE_OFICIAL}`;

export type OfferId = "pro" | "elite";

/**
 * F093 — item de plano é **uma linha só**, que se explica sozinha.
 *
 * Era título curto + parágrafo de apoio: 12 itens viravam 24 blocos de texto
 * e a lista não era lida até o fim. Agora cada linha carrega o benefício e a
 * prova junto ("12 sites prontos por nicho: troca os dados do cliente e
 * publica em minutos"). Se a linha precisa de explicação embaixo, ela está
 * mal escrita.
 *
 * Esta é a fonte única: `/planos` e `/planos-v2` leem daqui.
 */
export type OfferHighlight = {
  texto: string;
  /** Renderiza com peso maior no card (a garantia do Elite). */
  destaque?: boolean;
  /** Promessa que a operação ainda precisa assumir (ver spec F093). */
  novo?: boolean;
};

/**
 * Desliga de uma vez os itens que a operação ainda não entrega
 * (`novo: true`). Ver "Compromissos operacionais" na spec F093.
 */
export const INCLUIR_PROMESSAS_NOVAS: boolean = true;

const ITENS_PRO: OfferHighlight[] = [
  {
    texto:
      "12 sites prontos por nicho: troca os dados do cliente e publica em minutos — e o prompt-mestre gera qualquer outro",
  },
  {
    texto:
      "27 scripts de venda do primeiro “oi” ao contrato assinado, prontos pra copiar, trocar o nome e mandar",
  },
  {
    texto:
      "Orion: as empresas da sua cidade que estão sem site (ou com site quebrado), com telefone, prioridade e a abordagem pronta",
  },
  {
    texto:
      "Contrato à prova de calote, proposta, briefing e tabela de preço prontos pra preencher e enviar hoje",
  },
  {
    texto:
      "Formação completa em 66 aulas: do zero ao primeiro site entregue, cobrado e no ar",
  },
  { texto: "Ingresso da Imersão 2 a 5k com IA já incluso, sem pagar à parte" },
  {
    texto:
      "Comunidade que te destrava na mesma noite — quem já resolveu esse erro responde você",
  },
  { texto: "7 dias pra testar tudo por dentro: não serviu, devolvemos 100%" },
];

const ITENS_ELITE: OfferHighlight[] = [
  {
    texto:
      "Tudo do PRO: os 12 sites, os 27 scripts, as 66 aulas, o Orion e o arsenal inteiro",
  },
  {
    texto:
      "Fechou cliente em 90 dias ou devolvemos 100% — a lista que vale a garantia está aberta antes de você comprar",
    destaque: true,
  },
  {
    texto:
      "Plantão ao vivo toda semana pra você abrir a tela e destravar o SEU caso: o orçamento que travou, o cliente que sumiu",
  },
  {
    texto:
      "Orion no plano PRO por 90 dias: prospecção sem o teto do Free, justo nos meses que valem a garantia",
  },
  {
    texto:
      "Seu mapa de 90 dias semana a semana — você nunca abre a plataforma sem saber o que fazer hoje",
  },
  {
    texto:
      "A gente revisa a proposta do seu primeiro cliente antes de você mandar",
    novo: true,
  },
  {
    texto:
      "Resposta garantida em 24h úteis enquanto a sua garantia estiver correndo",
    novo: true,
  },
  {
    texto:
      "Modelo de CMS incluso — o painel em que o cliente edita o site (só Elite)",
  },
  {
    texto:
      "CRM e agente de WhatsApp inclusos assim que saírem — a porta da recorrência mensal",
    novo: true,
  },
];

function filtrarItens(itens: OfferHighlight[]): OfferHighlight[] {
  return INCLUIR_PROMESSAS_NOVAS ? itens : itens.filter((i) => !i.novo);
}

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
  /** Linha de segurança logo acima do CTA do rodapé do card (F093). */
  notaFinal?: string;
};

/** Checkout de boleto Elite na página de planos. */
export const CHECKOUT_ELITE_BOLETO_URL =
  "https://pay.tmb.com.br/DevemDobro/9DW254247E5";

/** Codes TMB que o webhook ainda reconhece como Elite (o 2º não é CTA). */
export const CHECKOUT_ELITE_BOLETO_URLS = [
  CHECKOUT_ELITE_BOLETO_URL,
  "https://pay.tmb.com.br/DevemDobro/3XB272209KV",
] as const;

/**
 * Preços como constantes puras: a detecção de CTA no corpo do Presente
 * (F070) precisa deles sem acionar `process.env` — ela roda no cliente e
 * no script de auditoria.
 */
export const PRICING_PRO: OfferPricing = {
  installments: 12,
  installmentPrice: "R$ 30,18",
  fullPrice: "R$ 297",
};

export const PRICING_ELITE: OfferPricing = {
  installments: 12,
  installmentPrice: "R$ 101,30",
  fullPrice: "R$ 997",
  boletoPrice: "R$ 1.297",
};

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
    pricing: PRICING_PRO,
    paymentHint: "Pagamento em cartão ou Pix",
    promise: PROMESSA_PRO,
    highlights: filtrarItens(ITENS_PRO),
    notaFinal:
      "Quer que a gente ande junto e assuma o risco dos 90 dias? Olhe o Elite. Começou pelo PRO e mudou de ideia depois? Você paga só a diferença.",
    checkoutUrl: checkoutUrlPro(),
  };
}

export function ofertaElite(): ClubOffer {
  return {
    id: "elite",
    name: "Elite",
    pricing: PRICING_ELITE,
    promise: PROMESSA_ELITE,
    highlights: filtrarItens(ITENS_ELITE),
    notaFinal:
      "Pagamento pela Hubla. O acesso é liberado no seu primeiro login com o mesmo e-mail da compra.",
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
