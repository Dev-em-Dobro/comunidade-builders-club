"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActiveMember } from "@/lib/membership/require-member";
import { updateProfile, updateProfileSchema } from "@/lib/profile";
import { excluirConta, UltimoAdminError } from "@/lib/profile/excluir-conta";

export async function updateProfileAction(formData: FormData) {
  const { user } = await requireActiveMember();
  const raw = {
    displayName: String(formData.get("displayName") ?? ""),
    bio: String(formData.get("bio") ?? "") || null,
    avatarUrl: String(formData.get("avatarUrl") ?? "") || null,
  };
  updateProfileSchema.parse(raw);
  await updateProfile(user.id, raw);
  revalidatePath("/perfil");
  revalidatePath("/");
}

/** F059 — confirmação digitada; nada de `confirm()` do browser. */
const CONFIRMACAO_EXCLUSAO = "EXCLUIR";

export async function excluirContaAction(
  formData: FormData,
): Promise<{ erro: string } | void> {
  const { user } = await requireActiveMember();

  const confirmacao = String(formData.get("confirmacao") ?? "").trim();
  if (confirmacao !== CONFIRMACAO_EXCLUSAO) {
    return { erro: `Digite ${CONFIRMACAO_EXCLUSAO} para confirmar.` };
  }

  try {
    await excluirConta(user.id);
  } catch (e) {
    if (e instanceof UltimoAdminError) return { erro: e.message };
    throw e;
  }

  // Fora do try: `redirect` sinaliza por exceção e não pode ser capturado.
  redirect("/login?conta=excluida");
}
