"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma as db } from "@/lib/db";
import { canDecideEnrollments, requireChallengeMember, requireChallengeParticipant, requireChallengeStaff } from "@/lib/desafio/acesso";
import { canCheckIn, dayInSaoPaulo, END, LAST_ENROLLMENT_DAY, weekOn, WEEKS } from "@/lib/desafio/calendario";
import { writeParticipantActivity } from "@/lib/desafio/operacoes";
import { autoApproves, checkinSchema, contactChangeSchema, contactSchema, enrollmentSchema, nextStatuses } from "@/lib/desafio/regras";

type Result = { message: string; ok?: boolean };

function result(ok: boolean, success: string, failure: string): Result {
  if (ok) {
    revalidatePath("/desafio", "layout");
    revalidatePath("/admin/desafio");
  }
  return { ok, message: ok ? success : failure };
}

export async function enroll(_: Result, form: FormData): Promise<Result> {
  const member = await requireChallengeMember();
  const now = new Date();
  if (dayInSaoPaulo(now) > LAST_ENROLLMENT_DAY) return { message: "As inscrições terminaram em 14/12." };
  const data = enrollmentSchema.safeParse({ ...Object.fromEntries(form), commitments: form.getAll("commitments") });
  if (!data.success) return { message: "Confira os campos e marque todos os compromissos." };
  const approved = autoApproves(process.env.CHALLENGE_AUTO_APPROVE, data.data.weeklyHours);
  const created = await db.challengeEnrollment.createMany({
    data: {
      ...data.data, userId: member.user.id, appliedAt: now,
      ...(approved ? { status: "aprovado" as const, approvedAt: now, joinedWeek: weekOn(dayInSaoPaulo(now)).number } : {}),
    },
    skipDuplicates: true,
  });
  return result(Boolean(created.count), approved ? "Cadastro aprovado. Bem-vindo ao desafio!" : "Cadastro enviado.", "Já existe um cadastro para esta conta.");
}

const enrollmentDecision = z.object({
  userId: z.string().min(1),
  status: z.enum(["aprovado", "recusado", "removido"]),
  reason: z.string().trim().max(500),
}).refine(({ status, reason }) => status === "aprovado" || Boolean(reason));

export async function decideEnrollment(_: Result, form: FormData): Promise<Result> {
  const staff = await requireChallengeStaff();
  if (!canDecideEnrollments(staff.membership.role)) return { message: "Só admin pode aprovar, recusar ou remover." };
  const data = enrollmentDecision.safeParse(Object.fromEntries(form));
  if (!data.success) return { message: "Informe o motivo para recusar ou remover a inscrição." };
  const { userId, status, reason } = data.data;
  const now = new Date();
  if (status === "aprovado" && dayInSaoPaulo(now) > END) return { message: "O desafio já terminou." };
  const updated = await db.challengeEnrollment.updateMany({
    where: { userId, status: status === "removido" ? "aprovado" : "pendente" },
    data: {
      status,
      removedReason: reason || null,
      ...(status === "aprovado" ? { approvedAt: now, joinedWeek: weekOn(dayInSaoPaulo(now)).number } : {}),
    },
  });
  return result(Boolean(updated.count), "Cadastro atualizado.", "O status do cadastro já mudou.");
}

export async function createWarmContact(_: Result, form: FormData): Promise<Result> {
  const { member } = await requireChallengeParticipant();
  const data = contactSchema.safeParse(Object.fromEntries(form));
  if (!data.success) return { message: "Confira o nome, o tipo e a observação do contato." };
  if (dayInSaoPaulo(new Date()) > END) return { message: "O desafio já terminou." };
  const ok = await writeParticipantActivity(member.user.id, async (tx) => {
    await tx.warmContact.create({
      data: { ...data.data, userId: member.user.id, events: { create: { type: "listado" } } },
    });
    return true;
  });
  return result(ok, "Contato adicionado.", "O cadastro do desafio mudou. Atualize a página.");
}

export async function changeWarmContact(_: Result, form: FormData): Promise<Result> {
  const { member } = await requireChallengeParticipant();
  const data = contactChangeSchema.safeParse(Object.fromEntries(form));
  if (!data.success || !nextStatuses(data.data.previous).some((status) => status === data.data.status)) {
    return { message: "Selecione um próximo status válido e confira o valor." };
  }
  const { id, previous, status, closedValue } = data.data;
  const now = new Date();
  if (dayInSaoPaulo(now) > END) return { message: "O desafio já terminou." };
  const ok = await writeParticipantActivity(member.user.id, async (tx) => {
    const update = await tx.warmContact.updateMany({
      where: { id, userId: member.user.id, status: previous },
      data: {
        status,
        ...(status === "abordado" ? { approachedAt: now } : {}),
        ...(status === "fechado" ? { closedValue } : {}),
      },
    });
    if (!update.count) return false;
    await tx.warmContactEvent.create({ data: { contactId: id, type: status, at: now } });
    return true;
  });
  return result(ok, "Status atualizado.", "O contato mudou. Atualize a página.");
}

const followUpSchema = z.object({ id: z.string().min(1), nextFollowUpOn: z.string().date().optional() });

export async function followUpWarmContact(_: Result, form: FormData): Promise<Result> {
  const { member } = await requireChallengeParticipant();
  const data = followUpSchema.safeParse(Object.fromEntries(form));
  const now = new Date();
  const today = dayInSaoPaulo(now);
  if (!data.success || (data.data.nextFollowUpOn && data.data.nextFollowUpOn < today)) {
    return { message: "Informe uma data de retorno válida." };
  }
  if (today > END) return { message: "O desafio já terminou." };
  const { id, nextFollowUpOn } = data.data;
  const ok = await writeParticipantActivity(member.user.id, async (tx) => {
    const update = await tx.warmContact.updateMany({
      where: {
        id, userId: member.user.id, approachedAt: { not: null },
        status: { notIn: ["fechado", "perdido"] },
        ...(nextFollowUpOn ? { OR: [{ nextFollowUpOn: null }, { nextFollowUpOn: { not: nextFollowUpOn } }] } : {}),
      },
      data: nextFollowUpOn ? { nextFollowUpOn } : { followUps: { increment: 1 }, nextFollowUpOn: null },
    });
    if (!update.count) return false;
    await tx.warmContactEvent.create({
      data: { contactId: id, type: nextFollowUpOn ? "agendamento" : "retorno", at: now },
    });
    return true;
  });
  return result(ok, nextFollowUpOn ? "Retorno agendado." : "Retorno registrado.", "Atualize a página e confira o status do contato.");
}

export async function submitCheckin(_: Result, form: FormData): Promise<Result> {
  const { member, enrollment } = await requireChallengeParticipant();
  const data = checkinSchema.safeParse(Object.fromEntries(form));
  if (!data.success) return { message: "Confira as respostas. Na semana 1, informe o link publicado do portfólio." };
  const now = new Date();
  const { week, blocker, portfolioUrl, soldThisWeek, soldValue } = data.data;
  if (!canCheckIn(WEEKS[week - 1]!, enrollment.joinedWeek ?? 1, now)) {
    return { message: "O formulário desta semana está fora da janela de envio." };
  }
  const ok = await writeParticipantActivity(member.user.id, async (tx) => {
    const created = await tx.challengeCheckin.createMany({
      data: {
        userId: member.user.id, week, blocker, portfolioUrl,
        soldThisWeek, soldValue: soldThisWeek ? soldValue : null, submittedAt: now,
      },
      skipDuplicates: true,
    });
    return Boolean(created.count);
  });
  return result(ok, week === 7 ? "Resultado final registrado." : "Check-in enviado.", "O cadastro mudou ou este check-in já foi enviado.");
}
