"use server";

import { revalidatePath } from "next/cache";
import { requireActiveMember } from "@/lib/membership/require-member";
import { isPaidMembership } from "@/lib/membership/capabilities";
import { markLessonCompleted } from "@/lib/aulas";

export async function markLessonCompletedAction(
  lessonId: string,
  moduleSlug: string,
  lessonSlug: string,
) {
  const { user, membership } = await requireActiveMember();
  await markLessonCompleted(user.id, lessonId, {
    isPaid: isPaidMembership(membership),
  });
  revalidatePath("/aulas");
  revalidatePath(`/aulas/${moduleSlug}`);
  revalidatePath(`/aulas/${moduleSlug}/${lessonSlug}`);
}
