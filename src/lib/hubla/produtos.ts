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
  if (elite) map.set(elite, "elite");

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
 * Oferta casa primeiro. Com só HUBLA_OFFER_ID_PRO, oferta desconhecida no
 * produto Club não vira PRO — cai no mapa de produto (legado) ou elite se o
 * produto mapeia elite. Sem ofertas no evento, usa o mapa de produto.
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
    let foundPro = false;
    let temOfertaElite = false;
    for (const plan of offerMap.values()) {
      if (plan === "elite") temOfertaElite = true;
    }
    for (const id of opts.offerIds) {
      const plan = offerMap.get(id);
      if (plan === "elite") return "elite";
      if (plan === "pro") foundPro = true;
    }
    if (foundPro) return "pro";
    if (temOfertaElite) return null;
    return productMap.has(opts.productId) ? "elite" : null;
  }

  return productMap.get(opts.productId) ?? null;
}

export function planoDoProdutoHubla(
  productId: string,
  mapa = mapaProdutosHubla(),
): PlanoPagoHubla | null {
  return mapa.get(productId) ?? null;
}
