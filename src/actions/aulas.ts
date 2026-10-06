"use server";

import { revalidatePath } from "next/cache";
import { requireActiveMember } from "@/lib/membership/require-member";
import { isPaidMembership } from "@/lib/membership/capabilities";
import { setLessonCompleted } from "@/lib/aulas";

export async function setLessonCompletedAction(
  lessonId: string,
  moduleSlug: string,
  lessonSlug: string,
  completed: boolean,
) {
  if (typeof completed !== "boolean") throw new Error("Estado inválido.");
  const { user, membership } = await requireActiveMember();
  await setLessonCompleted(user.id, lessonId, completed, {
    isPaid: isPaidMembership(membership),
  });
  revalidatePath("/aulas");
  revalidatePath(`/aulas/${moduleSlug}`);
  revalidatePath(`/aulas/${moduleSlug}/${lessonSlug}`);
}
