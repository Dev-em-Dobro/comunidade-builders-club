import { z } from "zod";

export const COMMITMENTS = [
  "Faço as metas mínimas de abordagem toda semana.",
  "Registro minhas abordagens (quentes aqui, frias no Orion).",
  "Envio o check-in toda segunda.",
  "Entendo que posso ser removido se ficar duas semanas sem atividade.",
  "Entendo que, sem cumprir as metas, não vou conseguir o resultado de fechar um cliente em 45 dias.",
] as const;

export const WORK_STAGES = ["nunca fiz freela", "já fiz, mas sem cliente recorrente", "já tenho clientes"] as const;
export const HOURS = ["menos de 3h", "3–5h", "5–10h", "mais de 10h"] as const;
export const CONTACT_LABELS = {
  listado: "Listado", abordado: "Abordado", respondeu: "Respondeu",
  briefing: "Briefing", proposta: "Proposta", fechado: "Fechado", perdido: "Perdido",
} as const;
export const CONTACT_STATUSES = [
  "listado", "abordado", "respondeu", "briefing", "proposta", "fechado", "perdido",
] as const;

const yesNo = z.enum(["sim", "nao"]).transform((value) => value === "sim");
const amount = z.string().nullish().transform((value) => value?.trim().replace(",", ".") || undefined)
  .pipe(z.string().regex(/^\d{1,10}(?:\.\d{1,2})?$/).optional());
const httpsUrl = z.string().trim().max(500).url().refine((value) => /^https?:\/\//i.test(value));

export const enrollmentSchema = z.object({
  whatsapp: z.string().trim().regex(/^\+?[0-9 ()-]{10,24}$/).refine((value) => {
    const digits = value.replace(/\D/g, "").length;
    return digits >= 10 && digits <= 15;
  }),
  workStage: z.enum(WORK_STAGES),
  offer: z.string().trim().min(1).max(240),
  weeklyHours: z.enum(HOURS),
  hasPortfolio: yesNo,
  hasWarmContacts: yesNo,
  motivation: z.string().trim().min(1).max(500),
  commitments: z.array(z.string()).refine((values) =>
    values.length === COMMITMENTS.length && COMMITMENTS.every((_, index) => values.includes(String(index))),
  ).transform(() => [...COMMITMENTS]),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  kind: z.enum(["pessoa", "negocio"]),
  note: z.string().trim().max(500).transform((value) => value || null),
});

export const contactChangeSchema = z.object({
  id: z.string().min(1),
  previous: z.enum(CONTACT_STATUSES),
  status: z.enum(CONTACT_STATUSES),
  closedValue: amount,
});

export const checkinSchema = z.object({
  week: z.coerce.number().int().min(1).max(7),
  blocker: z.string().trim().min(1).max(500),
  portfolioUrl: z.string().nullish().transform((value) => value?.trim() || undefined).pipe(httpsUrl.optional()),
  soldThisWeek: yesNo,
  soldValue: amount,
}).refine((data) => data.week !== 1 || Boolean(data.portfolioUrl));

export function nextStatuses(current: (typeof CONTACT_STATUSES)[number]) {
  if (current === "perdido" || current === "fechado") return [];
  const next = CONTACT_STATUSES[CONTACT_STATUSES.indexOf(current) + 1];
  return [next, "perdido"] as const;
}

/** Aprovação automática (flag CHALLENGE_AUTO_APPROVE): só com ≥ 3h/semana. */
export function autoApproves(flag: string | undefined, weeklyHours: (typeof HOURS)[number]) {
  return flag?.trim().toLowerCase() === "true" && weeklyHours !== "menos de 3h";
}
