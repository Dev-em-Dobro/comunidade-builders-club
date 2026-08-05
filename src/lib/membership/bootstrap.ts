import { prisma } from "@/lib/db";
import { isEmailAllowed } from "./allowlist";

/**
 * Garante Profile + Membership no login.
 * E-mail na allowlist (F012) ou BOOTSTRAP_ADMIN_EMAIL → active na hora.
 * Membership `revoked` não é reativado pela allowlist.
 * Fast-path: membro active com profile → quase zero trabalho.
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

  if (existing?.status === "active" && profileExists) {
    if (isBootstrapAdmin && existing.role !== "admin") {
      await prisma.membership.update({
        where: { userId },
        data: { status: "active", role: "admin" },
      });
    }
    return;
  }

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

  if (!existing) {
    await prisma.membership.create({
      data: {
        userId,
        status: allowed ? "active" : "pending",
        role: isBootstrapAdmin ? "admin" : "member",
      },
    });
    return;
  }

  if (existing.status === "revoked") {
    if (isBootstrapAdmin) {
      await prisma.membership.update({
        where: { userId },
        data: { status: "active", role: "admin" },
      });
    }
    return;
  }

  if (existing.status === "pending" && allowed) {
    await prisma.membership.update({
      where: { userId },
      data: {
        status: "active",
        ...(isBootstrapAdmin ? { role: "admin" as const } : {}),
      },
    });
    return;
  }

  if (isBootstrapAdmin && existing.role !== "admin") {
    await prisma.membership.update({
      where: { userId },
      data: { status: "active", role: "admin" },
    });
  }
}
