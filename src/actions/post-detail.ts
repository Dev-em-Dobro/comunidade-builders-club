"use server";

import { requireActiveMember } from "@/lib/membership/require-member";
import {
  canFreeReadPost,
  isPaidMembership,
} from "@/lib/membership/capabilities";
import { getPost, recordPostView } from "@/lib/posts";

function serializeComment(c: {
  id: string;
  body: string;
  authorId: string;
  createdAt: Date;
  author: {
    profile: { displayName: string; avatarUrl: string | null } | null;
  };
  replies?: Array<{
    id: string;
    body: string;
    authorId: string;
    createdAt: Date;
    author: {
      profile: { displayName: string; avatarUrl: string | null } | null;
    };
  }>;
}) {
  return {
    id: c.id,
    body: c.body,
    authorId: c.authorId,
    createdAt: c.createdAt.toISOString(),
    authorName: c.author.profile?.displayName ?? "Membro",
    avatarUrl: c.author.profile?.avatarUrl ?? null,
    replies: (c.replies ?? []).map((r) => ({
      id: r.id,
      body: r.body,
      authorId: r.authorId,
      createdAt: r.createdAt.toISOString(),
      authorName: r.author.profile?.displayName ?? "Membro",
      avatarUrl: r.author.profile?.avatarUrl ?? null,
    })),
  };
}

export type PostDetailDto = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  linkUrl: string | null;
  videoUrl: string | null;
  authorId: string;
  pinnedAt: string | null;
  commentCount: number;
  reactionCount: number;
  viewCount: number;
  createdAt: string;
  space: { slug: string; name: string };
  authorName: string;
  avatarUrl: string | null;
  liked: boolean;
  comments: ReturnType<typeof serializeComment>[];
};

export async function getPostDetailAction(
  postId: string,
): Promise<PostDetailDto | null> {
  const member = await requireActiveMember();
  const post = await getPost(postId, { viewerId: member.user.id });
  if (!post) return null;

  // F041: mesma política de leitura da página do post.
  if (!isPaidMembership(member.membership) && !canFreeReadPost(post.space.slug)) {
    return null;
  }

  const viewCount =
    (await recordPostView(post.id, member.user.id)) ?? post.viewCount;

  return {
    id: post.id,
    title: post.title,
    body: post.body,
    imageUrl: post.imageUrl,
    linkUrl: post.linkUrl,
    videoUrl: post.videoUrl,
    authorId: post.authorId,
    pinnedAt: post.pinnedAt?.toISOString() ?? null,
    commentCount: post.commentCount,
    reactionCount: post.reactionCount,
    viewCount,
    createdAt: post.createdAt.toISOString(),
    space: { slug: post.space.slug, name: post.space.name },
    authorName: post.author.profile?.displayName ?? "Membro",
    avatarUrl: post.author.profile?.avatarUrl ?? null,
    liked: post.reactions.some((r) => r.userId === member.user.id),
    comments: post.comments.map(serializeComment),
  };
}
