/** Helpers de URL seguros (open redirect / javascript:). */

import { z } from "zod";

/**
 * Regex do Better Auth (`matchesOriginPattern` + allowRelativePaths).
 * O verify do magic-link faz `decodeURIComponent` de novo: `%5B` passa aqui,
 * vira `[` e o Better Auth responde INVALID_CALLBACK_URL.
 */
const BETTER_AUTH_CALLBACK_OK =
  /^\/(?!\/|\\|%2f|%5c)[\w\-.\+/@]*(?:\?[\w\-.\+/=&%@]*)?$/i;

function aceitoNoVerifyBetterAuth(url: string): boolean {
  if (!BETTER_AUTH_CALLBACK_OK.test(url)) return false;
  try {
    return BETTER_AUTH_CALLBACK_OK.test(decodeURIComponent(url));
  } catch {
    return false;
  }
}

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
    const valor = `${u.pathname}${u.search}` || "/";
    if (aceitoNoVerifyBetterAuth(valor)) return valor;
    const soPath = u.pathname || "/";
    return aceitoNoVerifyBetterAuth(soPath) ? soPath : "/";
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

/**
 * Sanitiza link anexado ao post: só https, sem credenciais, hostname válido.
 * Retorna null se vazio; lança se malicioso/inválido.
 */
export function sanitizeHttpsLink(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let u: URL;
  try {
    u = new URL(trimmed);
  } catch {
    throw new Error("Link inválido. Use uma URL https:// completa.");
  }
  if (u.protocol !== "https:") {
    throw new Error("Link deve usar https://");
  }
  if (u.username || u.password) {
    throw new Error("Link com credenciais não é permitido.");
  }
  if (!u.hostname || u.hostname.includes(" ")) {
    throw new Error("Link inválido.");
  }
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    throw new Error("Link não permitido.");
  }
  return u.toString();
}

/** Campo opcional: vazio/null ou URL https (também aceita path local /uploads). */
export const optionalMediaUrl = z
  .string()
  .max(2000)
  .optional()
  .nullable()
  .or(z.literal(""))
  .transform((v, ctx) => {
    if (v == null || v === "") return null;
    const trimmed = v.trim();
    if (trimmed.startsWith("/uploads/")) {
      if (trimmed.includes("..") || trimmed.includes("\\")) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "URL de mídia inválida." });
        return z.NEVER;
      }
      return trimmed;
    }
    try {
      return sanitizeHttpsLink(trimmed);
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: e instanceof Error ? e.message : "URL inválida",
      });
      return z.NEVER;
    }
  });

/** Campo opcional: vazio/null ou URL https externa. */
export const optionalHttpsUrl = z
  .string()
  .max(2000)
  .optional()
  .nullable()
  .or(z.literal(""))
  .transform((v, ctx) => {
    if (v == null || v === "") return null;
    try {
      return sanitizeHttpsLink(v);
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: e instanceof Error ? e.message : "URL inválida",
      });
      return z.NEVER;
    }
  });
