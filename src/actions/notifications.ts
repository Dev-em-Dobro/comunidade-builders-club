"use server";

import { revalidatePath } from "next/cache";
import { requireActiveMember } from "@/lib/membership/require-member";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";

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
