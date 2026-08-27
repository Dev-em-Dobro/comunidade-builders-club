/** Normaliza e-mail para lookup (lowercase, trim). */
export function normalizarEmailHubla(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  const email = raw.trim().toLowerCase();
  if (!email.includes("@")) return null;
  return email;
}

export function productIdDoEvento(event: {
  product?: { id?: string };
  products?: { id?: string }[];
}): string | null {
  const id = event.product?.id?.trim();
  if (id) return id;
  const primeiro = event.products?.[0]?.id?.trim();
  return primeiro || null;
}

type OfertaHubla = { id?: string; isOrderBump?: boolean };
type ProdutoComOfertas = { offers?: OfertaHubla[] };

/**
 * IDs da oferta comprada (`products[].offers`), não o catálogo do produto.
 * Com order bump, fica a oferta principal (`isOrderBump !== true`).
 */
export function offerIdsDoEvento(event: {
  product?: ProdutoComOfertas;
  products?: ProdutoComOfertas[];
}): string[] {
  const ofertas: { id: string; isOrderBump: boolean }[] = [];
  const seen = new Set<string>();
  const add = (offer?: OfertaHubla) => {
    const id = offer?.id?.trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    ofertas.push({ id, isOrderBump: offer?.isOrderBump === true });
  };

  for (const product of event.products ?? []) {
    for (const offer of product.offers ?? []) add(offer);
  }
  if (ofertas.length === 0) {
    for (const offer of event.product?.offers ?? []) add(offer);
  }

  const principais = ofertas.filter((o) => !o.isOrderBump);
  return (principais.length > 0 ? principais : ofertas).map((o) => o.id);
}

type HublaWebhookEventLike = {
  user?: { email?: string };
  subscription?: { payer?: { email?: string } };
  invoice?: { user?: { email?: string }; payer?: { email?: string } };
};

export function emailDoEvento(event: HublaWebhookEventLike): string | null {
  return emailsDoEvento(event)[0] ?? null;
}

/** Todos os e-mails do payload, já normalizados e sem duplicata. */
export function emailsDoEvento(event: HublaWebhookEventLike): string[] {
  const candidatos = [
    event.user?.email,
    event.subscription?.payer?.email,
    event.invoice?.user?.email,
    event.invoice?.payer?.email,
  ];
  const vistos = new Set<string>();
  const emails: string[] = [];
  for (const raw of candidatos) {
    const email = normalizarEmailHubla(raw);
    if (!email || vistos.has(email)) continue;
    vistos.add(email);
    emails.push(email);
  }
  return emails;
}
