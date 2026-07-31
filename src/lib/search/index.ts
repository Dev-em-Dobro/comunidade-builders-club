import { prisma } from "@/lib/db";

export async function searchAll(q: string) {
  const term = q.trim();
  if (term.length < 2) {
    return { posts: [], members: [], spaces: [] };
  }

  const [posts, members, spaces] = await Promise.all([
    prisma.post.findMany({
      where: { body: { contains: term, mode: "insensitive" } },
      include: {
        author: { include: { profile: true } },
        space: true,
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
    prisma.profile.findMany({
      where: {
        OR: [
          { displayName: { contains: term, mode: "insensitive" } },
          { bio: { contains: term, mode: "insensitive" } },
        ],
        user: { membership: { status: "active" } },
      },
      include: { user: true },
      take: 20,
    }),
    prisma.space.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { slug: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
        ],
      },
      take: 20,
    }),
  ]);

  return { posts, members, spaces };
}
