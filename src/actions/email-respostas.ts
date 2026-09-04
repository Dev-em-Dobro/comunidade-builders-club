"use server";

import { redirect } from "next/navigation";
import { optOutRepliesEmailByToken } from "@/lib/notifications/enviar-resposta";

export async function optOutRepliesEmailAction(formData: FormData) {
  const token = String(formData.get("t") ?? "");
  const result = await optOutRepliesEmailByToken(token);
  if (result === "ok") redirect("/email/respostas?ok=1");
  redirect("/email/respostas?erro=1");
}
