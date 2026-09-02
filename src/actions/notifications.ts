"use server";

import { revalidatePath } from "next/cache";
import { requireActiveMember } from "@/lib/membership/require-member";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";
import { setNotifyRepliesEmail } from "@/lib/notifications/enviar-resposta";
import { setNotifyReguaEmail } from "@/lib/regua";

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

/** F075 — liga/desliga e-mail da régua (48h sem acesso). */
export async function updateNotifyReguaEmailAction(formData: FormData) {
  const { user } = await requireActiveMember();
  const enabled = formData.get("notifyReguaEmail") === "1";
  await setNotifyReguaEmail(user.id, enabled);
  revalidatePath("/configuracoes");
}
