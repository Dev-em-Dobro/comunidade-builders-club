import { prisma } from "@/lib/db";
import type { Membership, Profile } from "@prisma/client";
import { isEmailAllowed } from "./allowlist";

export type BootstrapResult = {
  membership: Membership;
  profile: Profile;
};

/**
 * Garante Profile + Membership no login (F041 freemium).
 *
 * Hot path (membro active + profile): **1 query** no Postgres.
 * Email vem da sessão quando possível (sem SELECT em user).
 */
export async function ensureMemberBootstrap(
  userId: string,
  name: string,
  image: string | null | undefined,
  emailFromSession?: string | null,
): Promise<BootstrapResult | null> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      membership: true,
      profile: true,
    },
  });
  if (!row) return null;

  const email = (emailFromSession || row.email).toLowerCase();
  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const isBootstrapAdmin = !!adminEmail && email === adminEmail;
  const existing = row.membership;
  const profile = row.profile;

  // Fast-path: já active + profile — sem allowlist.
  if (existing?.status === "active" && profile) {
    if (isBootstrapAdmin && existing.role !== "admin") {
      const membership = await prisma.membership.update({
        where: { userId },
        data: { status: "active", tier: "elite", role: "admin" },
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
        tier: isBootstrapAdmin ? "elite" : allowed ? "pro" : "free",
        role: isBootstrapAdmin ? "admin" : "member",
      },
    });
    return { membership, profile: nextProfile };
  }

  if (existing.status === "revoked") {
    if (isBootstrapAdmin) {
      const membership = await prisma.membership.update({
        where: { userId },
        data: { status: "active", tier: "elite", role: "admin" },
      });
      return { membership, profile: nextProfile };
    }
    return { membership: existing, profile: nextProfile };
  }

  if (existing.status === "pending") {
    const membership = await prisma.membership.update({
      where: { userId },
      data: {
        status: "active",
        tier: isBootstrapAdmin ? "elite" : allowed ? "pro" : "free",
        ...(isBootstrapAdmin ? { role: "admin" as const } : {}),
      },
    });
    return { membership, profile: nextProfile };
  }

  return { membership: existing, profile: nextProfile };
}
