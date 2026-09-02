"use server";

import { redirect } from "next/navigation";
import { optOutReguaEmailByToken } from "@/lib/regua";

export async function optOutReguaEmailAction(formData: FormData) {
  const token = String(formData.get("t") ?? "");
  const result = await optOutReguaEmailByToken(token);
  if (result === "ok") redirect("/email/regua?ok=1");
  redirect("/email/regua?erro=1");
}
