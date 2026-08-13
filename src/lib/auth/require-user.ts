import { cache } from "react";
import { headers } from "next/headers";
import { auth, type AuthUser } from "./index";
import { AuthError } from "./errors";

/** Sessão Better Auth — deduplica no mesmo request RSC. */
export const requireUser = cache(async (): Promise<AuthUser> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new AuthError("Sessão necessária. Faça login para continuar.");
  }

  return session.user;
});

export const getOptionalUser = cache(async (): Promise<AuthUser | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
});
