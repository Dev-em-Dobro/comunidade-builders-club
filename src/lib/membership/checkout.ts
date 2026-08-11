// F041 — URL de checkout Hubla (oferta Raphael).

export function urlCheckoutBuildersClub(): string | null {
  return process.env.HUBLA_CHECKOUT_URL?.trim() || null;
}

/** Fallback até a oferta definitiva existir. */
export const CHECKOUT_FALLBACK_URL =
  "https://pay.hub.la/v1SsMcVXNip7Mn5A2pNH";

export function checkoutUrlBuildersClub(): string {
  return urlCheckoutBuildersClub() || CHECKOUT_FALLBACK_URL;
}
