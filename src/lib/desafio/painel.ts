import { cache } from "react";
import type { ChallengeEnrollment } from "@prisma/client";
import { getCheckins, getContacts, getEnrollments, getProgressByUsers, getRequiredLessons } from "./dados";
import { challengeProgress } from "./progresso";

export const getParticipantProgress = cache(async (enrollment: ChallengeEnrollment, nowIso?: string) => {
  const [contacts, checkins, lessons] = await Promise.all([
    getContacts(enrollment.userId), getCheckins(enrollment.userId), getRequiredLessons(),
  ]);
  const completions = await getProgressByUsers([enrollment.userId], lessons.map((lesson) => lesson.lessonId));
  return challengeProgress({ enrollment, contacts, checkins, lessons, completions, now: nowIso ? new Date(nowIso) : new Date() });
});

export const getTeamDashboard = cache(async (nowIso?: string) => {
  const [enrollments, lessons] = await Promise.all([getEnrollments(), getRequiredLessons()]);
  const completions = await getProgressByUsers(enrollments.map((entry) => entry.userId), lessons.map((lesson) => lesson.lessonId));
  const byUser = new Map<string, typeof completions>();
  for (const completion of completions) {
    const items = byUser.get(completion.userId) ?? [];
    items.push(completion);
    byUser.set(completion.userId, items);
  }
  const now = nowIso ? new Date(nowIso) : new Date();
  return enrollments.map((enrollment) => {
    const { user } = enrollment;
    const progress = enrollment.status === "aprovado" ? challengeProgress({
      enrollment, contacts: user.warmContacts, checkins: user.challengeCheckins,
      lessons, completions: byUser.get(enrollment.userId) ?? [], now,
    }) : null;
    return { enrollment, user, progress };
  });
});
