import { cache } from "react";
import type { ChallengeEnrollment } from "@prisma/client";
import { dayInSaoPaulo } from "./calendario";
import { getCheckins, getContacts, getEnrollments, getProgressByUsers, getRequiredLessons } from "./dados";
import { buscarEstatisticasOrion, coldForEmail } from "./orion";
import { challengeProgress } from "./progresso";

export const getParticipantProgress = cache(async (enrollment: ChallengeEnrollment, email: string, nowIso?: string) => {
  const now = nowIso ? new Date(nowIso) : new Date();
  const [contacts, checkins, lessons, orion] = await Promise.all([
    getContacts(enrollment.userId), getCheckins(enrollment.userId), getRequiredLessons(),
    buscarEstatisticasOrion([email], dayInSaoPaulo(now)),
  ]);
  const completions = await getProgressByUsers([enrollment.userId], lessons.map((lesson) => lesson.lessonId));
  return challengeProgress({ enrollment, contacts, checkins, lessons, completions, now, cold: coldForEmail(orion, email) });
});

export const getTeamDashboard = cache(async (nowIso?: string) => {
  const now = nowIso ? new Date(nowIso) : new Date();
  const [enrollments, lessons] = await Promise.all([getEnrollments(), getRequiredLessons()]);
  const approved = enrollments.filter((entry) => entry.status === "aprovado");
  const [completions, orion] = await Promise.all([
    getProgressByUsers(approved.map((entry) => entry.userId), lessons.map((lesson) => lesson.lessonId)),
    buscarEstatisticasOrion(approved.map((entry) => entry.user.email), dayInSaoPaulo(now)),
  ]);
  const byUser = new Map<string, typeof completions>();
  for (const completion of completions) {
    const items = byUser.get(completion.userId) ?? [];
    items.push(completion);
    byUser.set(completion.userId, items);
  }
  const entries = enrollments.map((enrollment) => {
    const { user } = enrollment;
    const progress = enrollment.status === "aprovado" ? challengeProgress({
      enrollment, contacts: user.warmContacts, checkins: user.challengeCheckins,
      lessons, completions: byUser.get(enrollment.userId) ?? [], now, cold: coldForEmail(orion, user.email),
    }) : null;
    return { enrollment, user, progress };
  });
  return { entries, orionAvailable: orion !== null };
});
