// F053 — mapa Hubla product id → plano (pro | elite).

export type PlanoPagoHubla = "pro" | "elite";

function trimId(value: string | undefined): string | null {
  const v = value?.trim();
  return v || null;
}

/** IDs configurados. Vazio = webhook deve recusar (503). */
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

export function planoDoProdutoHubla(
  productId: string,
  mapa = mapaProdutosHubla(),
): PlanoPagoHubla | null {
  return mapa.get(productId) ?? null;
}
