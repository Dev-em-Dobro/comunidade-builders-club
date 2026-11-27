"use server";

import { revalidatePath } from "next/cache";
import {
  requireActiveMember,
  requireMemberSemRestricao,
} from "@/lib/membership/require-member";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";
import { setNotifyRepliesEmail } from "@/lib/notifications/enviar-resposta";

export async function markReadAction(id: string) {
  const { user } = await requireMemberSemRestricao();
  await markNotificationRead(id, user.id);
  revalidatePath("/notificacoes");
  revalidatePath("/", "layout");
}

export async function markAllReadAction() {
  const { user } = await requireMemberSemRestricao();
  await markAllNotificationsRead(user.id);
  revalidatePath("/notificacoes");
  revalidatePath("/", "layout");
}

/** F073 — liga/desliga e-mail agrupado de respostas. */
export async function updateNotifyRepliesEmailAction(formData: FormData) {
  // F128 — preferência da tela de Configurações, aberta também à conta restrita.
  const { user } = await requireActiveMember();
  const enabled = formData.get("notifyRepliesEmail") === "1";
  await setNotifyRepliesEmail(user.id, enabled);
  revalidatePath("/configuracoes");
}
