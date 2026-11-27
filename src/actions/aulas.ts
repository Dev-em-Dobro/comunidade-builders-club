"use server";

import { revalidatePath } from "next/cache";
import { requireActiveMember } from "@/lib/membership/require-member";
import {
  isPaidMembership,
  isRestritoMembership,
} from "@/lib/membership/capabilities";
import { listPurchasedModuleIds, setLessonCompleted } from "@/lib/aulas";

export async function setLessonCompletedAction(
  lessonId: string,
  moduleSlug: string,
  lessonSlug: string,
  completed: boolean,
) {
  if (typeof completed !== "boolean") throw new Error("Estado inválido.");
  const { user, membership } = await requireActiveMember();
  const isPaid = isPaidMembership(membership);
  await setLessonCompleted(user.id, lessonId, completed, {
    isPaid,
    purchased: await listPurchasedModuleIds({ email: user.email, isPaid }),
    restrito: isRestritoMembership(membership),
  });
  revalidatePath("/aulas");
  revalidatePath(`/aulas/${moduleSlug}`);
  revalidatePath(`/aulas/${moduleSlug}/${lessonSlug}`);
}
