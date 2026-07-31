import type { MembershipStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  addAllowedEmail,
  listAllowedEmails,
  removeAllowedEmail,
} from "@/lib/membership/allowlist";

export async function listMemberships() {
  return prisma.membership.findMany({
    include: {
      user: { include: { profile: true } },
    },
    orderBy: { createdAt: "desc" },
  });
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