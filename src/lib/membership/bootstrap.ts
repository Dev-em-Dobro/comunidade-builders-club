import { prisma } from "@/lib/db";
import { isEmailAllowed } from "./allowlist";

/**
 * Garante Profile + Membership no login (F041 freemium).
 * - Allowlist / Hubla / BOOTSTRAP_ADMIN → active + paid (+ admin se bootstrap)
 * - Sem allowlist → active + free (entra na comunidade limitada)
 * - Membership `revoked` não é reativado pela allowlist (só bootstrap admin)
 */
export async function ensureMemberBootstrap(
  userId: string,
  name: string,
  image: string | null | undefined,
): Promise<void> {
  const [user, existing, profileExists] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.membership.findUnique({ where: { userId } }),
    prisma.profile.findUnique({
      where: { userId },
      select: { userId: true },
    }),
  ]);
  if (!user) return;

  const email = user.email.toLowerCase();
  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const isBootstrapAdmin = !!adminEmail && email === adminEmail;
  const allowed = isBootstrapAdmin || (await isEmailAllowed(email));

  if (!profileExists) {
    await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: name || email.split("@")[0] || "Membro",
        avatarUrl: image ?? null,
      },
      update: {},
    });
  }

  // Fast-path: já active + profile; só sincroniza paid/admin se necessário.
  if (existing?.status === "active" && profileExists) {
    const needsAdmin =
      isBootstrapAdmin && existing.role !== "admin";
    const needsPaid =
      (allowed || isBootstrapAdmin) && existing.tier !== "paid";
    if (needsAdmin || needsPaid) {
      await prisma.membership.update({
        where: { userId },
        data: {
          status: "active",
          tier: "paid",
          ...(needsAdmin || isBootstrapAdmin
            ? { role: "admin" as const }
            : {}),
        },
      });
    }
    return;
  }

  if (!existing) {
    await prisma.membership.create({
      data: {
        userId,
        status: "active",
        tier: allowed || isBootstrapAdmin ? "paid" : "free",
        role: isBootstrapAdmin ? "admin" : "member",
      },
    });
    return;
  }

  if (existing.status === "revoked") {
    if (isBootstrapAdmin) {
      await prisma.membership.update({
        where: { userId },
        data: { status: "active", tier: "paid", role: "admin" },
      });
    }
    return;
  }

  // pending legado → active free ou paid
  if (existing.status === "pending") {
    await prisma.membership.update({
      where: { userId },
      data: {
        status: "active",
        tier: allowed || isBootstrapAdmin ? "paid" : "free",
        ...(isBootstrapAdmin ? { role: "admin" as const } : {}),
      },
    });
  }
}
