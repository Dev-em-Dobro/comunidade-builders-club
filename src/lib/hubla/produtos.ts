// F053 — mapa Hubla product/offer id → plano (pro | elite).
// PRO e Elite são ofertas do mesmo produto Club; o discriminador é offers[].id.

export type PlanoPagoHubla = "pro" | "elite";

function collectIds(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function trimId(value: string | undefined): string | null {
  const v = value?.trim();
  return v || null;
}

/** IDs de produto. Vazio + mapa de ofertas vazio = webhook deve recusar (503). */
export function mapaProdutosHubla(): Map<string, PlanoPagoHubla> {
  const map = new Map<string, PlanoPagoHubla>();

  const legado = trimId(process.env.HUBLA_PRODUCT_ID);
  const pro = trimId(process.env.HUBLA_PRODUCT_ID_PRO);
  const elite = trimId(process.env.HUBLA_PRODUCT_ID_ELITE);

  if (legado) map.set(legado, "pro");
  if (pro) map.set(pro, "pro");
  // Mesmo product.id que o Club: PRO/Elite discriminam por oferta, não daqui.
  if (elite && elite !== legado && elite !== pro) map.set(elite, "elite");

  return map;
}

/** Ofertas no mesmo produto Club. Elite sobrescreve se o id coincidir. */
export function mapaOfertasHubla(): Map<string, PlanoPagoHubla> {
  const map = new Map<string, PlanoPagoHubla>();
  for (const id of collectIds(process.env.HUBLA_OFFER_ID_PRO)) {
    map.set(id, "pro");
  }
  for (const id of collectIds(process.env.HUBLA_OFFER_ID_ELITE)) {
    map.set(id, "elite");
  }
  return map;
}

export function webhookHublaConfigurado(
  productMap = mapaProdutosHubla(),
  offerMap = mapaOfertasHubla(),
): boolean {
  return productMap.size > 0 || offerMap.size > 0;
}

/**
 * Casa o id da oferta comprada: PRO → pro, Elite → elite.
 * Várias ofertas no mesmo evento (order bump): cada id conta; se PRO e Elite
 * aparecerem juntos, não escolhe Elite por padrão — quem chama já deve ter
 * filtrado a oferta principal (`isOrderBump !== true`).
 * Oferta desconhecida cai no mapa de produto (Club = pro), nunca em elite.
 */
export function planoDoEventoHubla(opts: {
  productId: string;
  offerIds: string[];
  productMap?: Map<string, PlanoPagoHubla>;
  offerMap?: Map<string, PlanoPagoHubla>;
}): PlanoPagoHubla | null {
  const productMap = opts.productMap ?? mapaProdutosHubla();
  const offerMap = opts.offerMap ?? mapaOfertasHubla();

  if (offerMap.size > 0 && opts.offerIds.length > 0) {
    const matched = new Set<PlanoPagoHubla>();
    for (const id of opts.offerIds) {
      const plan = offerMap.get(id);
      if (plan) matched.add(plan);
    }
    if (matched.size === 1) {
      const plan = [...matched][0];
      return plan ?? null;
    }
    if (matched.has("pro") && matched.has("elite")) {
      return "pro";
    }
    if (matched.size === 0) {
      const temOfertaElite = [...offerMap.values()].includes("elite");
      if (temOfertaElite) return null;
      return productMap.get(opts.productId) ?? null;
    }
  }

  return productMap.get(opts.productId) ?? null;
}

export function planoDoProdutoHubla(
  productId: string,
  mapa = mapaProdutosHubla(),
): PlanoPagoHubla | null {
  return mapa.get(productId) ?? null;
}
