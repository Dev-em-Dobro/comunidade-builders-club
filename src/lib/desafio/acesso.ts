import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { hrefPlanos, isPaidMembership } from "@/lib/membership/capabilities";
import { isStaff, requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { simulatedNow } from "./calendario";

export const getEnrollment = cache((userId: string) =>
  db.challengeEnrollment.findUnique({ where: { userId } }),
);

export async function requireChallengeMember() {
  const member = await requireActiveMemberOrRedirect();
  if (!isPaidMembership(member.membership)) redirect(hrefPlanos({ motivo: "desafio" }));
  return member;
}

export async function requireChallengeParticipant() {
  const member = await requireChallengeMember();
  const enrollment = await getEnrollment(member.user.id);
  if (enrollment?.status !== "aprovado" || enrollment.joinedWeek === null) redirect("/desafio");
  return { member, enrollment };
}

export async function requireChallengeStaff() {
  const member = await requireActiveMemberOrRedirect();
  if (!isStaff(member.membership.role)) redirect("/");
  return member;
}

/** "Agora" das telas: simulável pela equipe fora de produção (QA). */
export function challengeNow(role: Parameters<typeof isStaff>[0], agora?: string) {
  const allowed = isStaff(role) && process.env.VERCEL_ENV !== "production";
  return simulatedNow(agora, allowed);
}

export function canDecideEnrollments(role: Parameters<typeof isStaff>[0]) {
  return role === "admin";
}
