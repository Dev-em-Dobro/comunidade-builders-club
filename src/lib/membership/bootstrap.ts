import { prisma } from "@/lib/db";
import type { Membership, Profile } from "@prisma/client";
import { isEmailAllowed } from "./allowlist";

export type BootstrapResult = {
  membership: Membership;
  profile: Profile;
};

/**
 * Garante Profile + Membership no login (F041 freemium).
 * - Allowlist / Hubla / BOOTSTRAP_ADMIN → active + paid (+ admin se bootstrap)
 * - Sem allowlist → active + free (entra na comunidade limitada)
 * - Membership `revoked` não é reativado pela allowlist (só bootstrap admin)
 *
 * Hot path: membro já active + profile → 1 query (sem allowlist).
 */
export async function ensureMemberBootstrap(
  userId: string,
  name: string,
  image: string | null | undefined,
): Promise<BootstrapResult | null> {
  const [user, existing, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    }),
    prisma.membership.findUnique({ where: { userId } }),
    prisma.profile.findUnique({ where: { userId } }),
  ]);
  if (!user) return null;

  const email = user.email.toLowerCase();
  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const isBootstrapAdmin = !!adminEmail && email === adminEmail;

  // Fast-path: já active + profile — não consulta allowlist a cada request.
  // Paid/admin só sobe via Hubla, admin allowlist actions ou bootstrap admin.
  if (existing?.status === "active" && profile) {
    if (isBootstrapAdmin && existing.role !== "admin") {
      const membership = await prisma.membership.update({
        where: { userId },
        data: { status: "active", tier: "paid", role: "admin" },
      });
      return { membership, profile };
    }
    return { membership: existing, profile };
  }

  const allowed = isBootstrapAdmin || (await isEmailAllowed(email));

  let nextProfile = profile;
  if (!nextProfile) {
    nextProfile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: name || email.split("@")[0] || "Membro",
        avatarUrl: image ?? null,
      },
      update: {},
    });
  }

  if (!existing) {
    const membership = await prisma.membership.create({
      data: {
        userId,
        status: "active",
        tier: allowed || isBootstrapAdmin ? "paid" : "free",
        role: isBootstrapAdmin ? "admin" : "member",
      },
    });
    return { membership, profile: nextProfile };
  }

  if (existing.status === "revoked") {
    if (isBootstrapAdmin) {
      const membership = await prisma.membership.update({
        where: { userId },
        data: { status: "active", tier: "paid", role: "admin" },
      });
      return { membership, profile: nextProfile };
    }
    return { membership: existing, profile: nextProfile };
  }

  // pending legado → active free ou paid
  if (existing.status === "pending") {
    const membership = await prisma.membership.update({
      where: { userId },
      data: {
        status: "active",
        tier: allowed || isBootstrapAdmin ? "paid" : "free",
        ...(isBootstrapAdmin ? { role: "admin" as const } : {}),
      },
    });
    return { membership, profile: nextProfile };
  }

  return { membership: existing, profile: nextProfile };
}
