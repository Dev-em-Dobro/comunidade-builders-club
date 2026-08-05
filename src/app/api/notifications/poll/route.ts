import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  countUnread,
  listUnreadPreview,
  NOTIFICATION_LABELS,
} from "@/lib/notifications";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const userId = session.user.id;
  const [unread, preview] = await Promise.all([
    countUnread(userId),
    listUnreadPreview(userId, 8),
  ]);

  return NextResponse.json({
    unread,
    items: preview.map((n) => ({
      id: n.id,
      type: n.type,
      postId: n.postId,
      snippet: n.snippet,
      createdAt: n.createdAt.toISOString(),
      actorName: n.actor?.profile?.displayName ?? "Alguém",
      label: NOTIFICATION_LABELS[n.type] ?? n.type,
    })),
  });
}
