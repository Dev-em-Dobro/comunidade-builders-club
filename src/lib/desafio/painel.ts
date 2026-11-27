import { cache } from "react";
import type { ChallengeEnrollment } from "@prisma/client";
import { dayInSaoPaulo } from "./calendario";
import { getCheckins, getContacts, getEnrollments, getProgressByUsers, getRequiredLessons } from "./dados";
import { buscarEstatisticasOrion, coldForEmail } from "./orion";
import { challengeProgress } from "./progresso";
import type { RankingSource } from "./ranking";

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

/** Fontes do ranking: todos os inscritos aprovados (mesma leitura do painel da equipe). */
export const getRankingSources = cache(async (nowIso?: string): Promise<RankingSource[]> => {
  const { entries } = await getTeamDashboard(nowIso);
  return entries.flatMap(({ enrollment, user, progress }) => progress ? [{
    userId: enrollment.userId,
    name: user.profile?.displayName || user.name,
    avatarUrl: user.profile?.avatarUrl ?? null,
    score: progress.score,
    approaches: {
      total: progress.totalWarm + progress.coldTotal,
      byWeek: progress.weeks.map((week) => week.warmCount + week.coldCount),
    },
    badges: progress.badges,
  }] : []);
});
