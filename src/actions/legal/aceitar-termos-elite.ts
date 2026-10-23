"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { requireActiveMember } from "@/lib/membership/require-member";
import { contextoAceiteDeHeaders } from "@/lib/membership/aceite-legal";
import { registrarAceiteTermosElite } from "@/lib/membership/aceite-termos-elite";

export async function aceitarTermosEliteAction(aceitou: boolean): Promise<
  { ok: true } | { ok: false; erro: string }
> {
  if (!z.literal(true).safeParse(aceitou).success) {
    return { ok: false, erro: "Marque a caixa para confirmar o aceite." };
  }
  try {
    const member = await requireActiveMember();
    if (member.membership.tier !== "elite") {
      return { ok: false, erro: "Os termos do Elite são exclusivos deste plano." };
    }
    await registrarAceiteTermosElite(
      member.user.id,
      member.membership.eliteStartedAt,
      contextoAceiteDeHeaders(await headers()),
    );
    return { ok: true };
  } catch {
    return { ok: false, erro: "Não foi possível registrar o aceite. Tente de novo." };
  }
}
