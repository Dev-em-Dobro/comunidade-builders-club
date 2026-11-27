// F128 — acesso restrito: conta que nasceu de compra de módulo avulso.
//
// "Entrada" é para onde a conta restrita vai ao logar e quando tenta abrir
// uma rota fechada para ela. Sem dependência de Next.

import { prisma } from "@/lib/db";

export const ENTRADA_SEM_MODULO = "/planos";
export const ENTRADA_VARIOS_MODULOS = "/aulas";

/** Decide a entrada a partir dos slugs dos módulos comprados e publicados. */
export function entradaPorModulos(slugs: readonly string[]): string {
  if (slugs.length === 0) return ENTRADA_SEM_MODULO;
  if (slugs.length === 1) return `/aulas/${slugs[0]}`;
  return ENTRADA_VARIOS_MODULOS;
}

export async function entradaContaRestrita(email: string): Promise<string> {
  const compras = await prisma.modulePurchase.findMany({
    where: { email: email.trim().toLowerCase(), module: { published: true } },
    select: { module: { select: { slug: true } } },
    orderBy: { createdAt: "asc" },
  });
  return entradaPorModulos(compras.map((c) => c.module.slug));
}
