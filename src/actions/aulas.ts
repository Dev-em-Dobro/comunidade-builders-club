"use server";

import { revalidatePath } from "next/cache";
import { requirePaidMember } from "@/lib/membership/require-member";
import { markLessonCompleted } from "@/lib/aulas";

export async function markLessonCompletedAction(
  lessonId: string,
  moduleSlug: string,
  lessonSlug: string,
) {
  const { user } = await requirePaidMember();
  await markLessonCompleted(user.id, lessonId);
  revalidatePath("/aulas");
  revalidatePath(`/aulas/${moduleSlug}/${lessonSlug}`);
}
