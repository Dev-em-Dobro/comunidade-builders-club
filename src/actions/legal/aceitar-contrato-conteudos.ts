"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { requireActiveMember } from "@/lib/membership/require-member";
import { contextoAceiteDeHeaders } from "@/lib/membership/aceite-legal";
import {
  membershipPagoPorCompra,
  registrarAceiteContratoConteudos,
} from "@/lib/membership/aceite-contrato-conteudos";

export async function aceitarContratoConteudosAction(
  aceitou: boolean,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  if (!z.literal(true).safeParse(aceitou).success) {
    return { ok: false, erro: "Marque a caixa para confirmar o aceite." };
  }
  try {
    const member = await requireActiveMember();
    if (!membershipPagoPorCompra(member.membership)) {
      return {
        ok: false,
        erro: "Este contrato vale para quem comprou o acesso pago.",
      };
    }
    await registrarAceiteContratoConteudos(
      member.user.id,
      contextoAceiteDeHeaders(await headers()),
    );
    return { ok: true };
  } catch {
    return {
      ok: false,
      erro: "Não foi possível registrar o aceite. Tente de novo.",
    };
  }
}
