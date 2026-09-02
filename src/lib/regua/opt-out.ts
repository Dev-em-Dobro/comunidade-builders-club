import { prisma } from "@/lib/db";
import { verifyReguaUnsubToken } from "./email-token";

export async function setNotifyReguaEmail(
  userId: string,
  enabled: boolean,
): Promise<void> {
  await prisma.profile.update({
    where: { userId },
    data: { notifyReguaEmail: enabled },
  });
}

export async function optOutReguaEmailByToken(
  token: string,
): Promise<"ok" | "invalid"> {
  const userId = verifyReguaUnsubToken(token);
  if (!userId) return "invalid";
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { userId: true },
  });
  if (!profile) return "invalid";
  await prisma.profile.update({
    where: { userId },
    data: { notifyReguaEmail: false },
  });
  return "ok";
}
