import type { MembershipStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  addAllowedEmail,
  listAllowedEmails,
  removeAllowedEmail,
} from "@/lib/membership/allowlist";

export async function listMemberships(opts?: {
  status?: MembershipStatus;
  q?: string;
}) {
  const q = opts?.q?.trim();
  return prisma.membership.findMany({
    where: {
      ...(opts?.status ? { status: opts.status } : {}),
      ...(q
        ? {
            OR: [
              { user: { email: { contains: q, mode: "insensitive" } } },
              {
                user: {
                  profile: {
                    displayName: { contains: q, mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      user: { include: { profile: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function countMembershipsByStatus() {
  const groups = await prisma.membership.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const counts = { pending: 0, active: 0, revoked: 0 };
  for (const g of groups) {
    counts[g.status] = g._count._all;
  }
  return counts;
}

export async function setMembershipStatus(
  userId: string,
  status: MembershipStatus,
) {
  return prisma.membership.update({
    where: { userId },
    data: { status },
  });
}

export async function setMembershipRole(userId: string, role: Role) {
  return prisma.membership.update({
    where: { userId },
    data: { role },
  });
}

export { addAllowedEmail, listAllowedEmails, removeAllowedEmail };
