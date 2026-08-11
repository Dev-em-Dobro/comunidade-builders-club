import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isPaidMembership } from "@/lib/membership/capabilities";

/** API: sessão + membership paid (ou staff). */
export async function membroPagoAtivo(): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return false;
  const m = await prisma.membership.findUnique({
    where: { userId: session.user.id },
  });
  return !!m && isPaidMembership(m);
}
