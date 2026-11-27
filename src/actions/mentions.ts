"use server";

import { requireMemberSemRestricao } from "@/lib/membership/require-member";
import { searchMembersForMention } from "@/lib/mentions";

export async function searchMentionMembersAction(q: string) {
  await requireMemberSemRestricao();
  return searchMembersForMention(q.slice(0, 64), 8);
}
