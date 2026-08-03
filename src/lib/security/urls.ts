/** Helpers de URL seguros (open redirect / javascript:). */

import { z } from "zod";

/** Path relativo interno: `/foo`, nunca `//evil` ou absoluto. */
export function safeCallbackPath(raw: string | null | undefined): string {
  if (!raw) return "/";
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return "/";
  }
  try {
    const u = new URL(trimmed, "https://callback.invalid");
    if (u.origin !== "https://callback.invalid") return "/";
    return `${u.pathname}${u.search}${u.hash}` || "/";
  } catch {
    return "/";
  }
}

export function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Campo opcional: vazio/null ou URL https. */
export const optionalHttpsUrl = z
  .string()
  .max(2000)
  .optional()
  .nullable()
  .or(z.literal(""))
  .refine((v) => v == null || v === "" || isHttpsUrl(v), {
    message: "URL deve usar https://",
  });
