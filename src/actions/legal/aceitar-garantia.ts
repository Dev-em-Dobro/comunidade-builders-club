"use server";

import { headers } from "next/headers";
import { requireUser } from "@/lib/auth/require-user";
import { contextoAceiteDeHeaders } from "@/lib/membership/aceite-legal";
import { registrarAceiteGarantia } from "@/lib/membership/aceite-garantia";

/** F090 — registra ciente da Lista da garantia (versão vigente). */
export async function aceitarGarantiaAction(): Promise<
  { ok: true } | { ok: false; erro: string }
> {
  try {
    const user = await requireUser();
    const h = await headers();
    await registrarAceiteGarantia(user.id, contextoAceiteDeHeaders(h));
    return { ok: true };
  } catch {
    return {
      ok: false,
      erro: "Não foi possível registrar o ciente. Tente de novo.",
    };
  }
}
