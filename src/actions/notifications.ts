"use server";

import { revalidatePath } from "next/cache";
import { requireActiveMember } from "@/lib/membership/require-member";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";
import { setNotifyRepliesEmail } from "@/lib/notifications/enviar-resposta";

export async function markReadAction(id: string) {
  const { user } = await requireActiveMember();
  await markNotificationRead(id, user.id);
  revalidatePath("/notificacoes");
  revalidatePath("/", "layout");
}

export async function markAllReadAction() {
  const { user } = await requireActiveMember();
  await markAllNotificationsRead(user.id);
  revalidatePath("/notificacoes");
  revalidatePath("/", "layout");
}

/** F073 — liga/desliga e-mail agrupado de respostas. */
export async function updateNotifyRepliesEmailAction(formData: FormData) {
  const { user } = await requireActiveMember();
  const enabled = formData.get("notifyRepliesEmail") === "1";
  await setNotifyRepliesEmail(user.id, enabled);
  revalidatePath("/configuracoes");
}
