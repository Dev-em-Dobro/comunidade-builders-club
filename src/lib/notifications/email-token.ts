import { createHmac, timingSafeEqual } from "node:crypto";
import { requireAuthEnv } from "@/lib/auth/env";

const PREFIX = "f073-unsub:";

export function signEmailUnsubToken(userId: string): string {
  const sig = createHmac("sha256", requireAuthEnv("BETTER_AUTH_SECRET"))
    .update(`${PREFIX}${userId}`)
    .digest("hex");
  return `${userId}.${sig}`;
}

export function verifyEmailUnsubToken(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const userId = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!userId || !/^[a-f0-9]{64}$/.test(sig)) return null;

  const expected = createHmac("sha256", requireAuthEnv("BETTER_AUTH_SECRET"))
    .update(`${PREFIX}${userId}`)
    .digest("hex");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return userId;
}
