import { headers } from "next/headers";
import { auth, type AuthUser } from "./index";
import { AuthError } from "./errors";

export async function requireUser(): Promise<AuthUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new AuthError("Sessão necessária. Faça login para continuar.");
  }

  return session.user;
}

export async function getOptionalUser(): Promise<AuthUser | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}
