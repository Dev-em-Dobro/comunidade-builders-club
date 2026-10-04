import { z } from "zod";
import { parseUpgradeReason, type UpgradeReason } from "./capabilities";

export const UPGRADE_FUNNEL_STEPS = ["planos_view", "checkout_click"] as const;
export const UPGRADE_FUNNEL_PLANS = ["pro_mensal", "pro_anual", "elite"] as const;

export type UpgradeFunnelStep = (typeof UPGRADE_FUNNEL_STEPS)[number];
export type UpgradeFunnelPlan = (typeof UPGRADE_FUNNEL_PLANS)[number];

export type UpgradeFunnelEventInput = {
  step: UpgradeFunnelStep;
  plan: UpgradeFunnelPlan | null;
  motivo: UpgradeReason | null;
};

const inputSchema = z
  .object({
    step: z.enum(UPGRADE_FUNNEL_STEPS),
    plan: z.enum(UPGRADE_FUNNEL_PLANS).nullish(),
    motivo: z.string().trim().max(80).nullish(),
  })
  .strict();

export function parseUpgradeFunnelEvent(value: unknown): UpgradeFunnelEventInput | null {
  const parsed = inputSchema.safeParse(value);
  if (!parsed.success) return null;

  const { step } = parsed.data;
  const plan = parsed.data.plan ?? null;
  if (step === "checkout_click" && !plan) return null;

  return {
    step,
    plan: step === "checkout_click" ? plan : null,
    motivo: parseUpgradeReason(parsed.data.motivo ?? undefined) ?? null,
  };
}
