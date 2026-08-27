import { prisma } from "@/lib/db";
import { AULA_THREADS_SPACE_SLUG } from "@/lib/spaces/constants";
import { FREE_SPACE_SLUGS } from "@/lib/membership/capabilities";

/**
 * F063 — a busca é liberada para free, mas a listagem não pode devolver
 * conteúdo de space pago. `aula-threads` já era excluído para todo mundo;
 * para free, o resultado fica restrito aos spaces de `FREE_SPACE_SLUGS`.
 */
function filtroDeSpace(isPaid: boolean) {
  if (isPaid) {
    return { slug: { not: AULA_THREADS_SPACE_SLUG } };
  }
  return { slug: { in: [...FREE_SPACE_SLUGS] } };
}

export async function searchAll(q: string, opts?: { isPaid?: boolean }) {
  const isPaid = opts?.isPaid ?? true;
  const term = q.trim();
  if (term.length < 2) {
    return { posts: [], members: [], spaces: [] };
  }

  const spaceWhere = filtroDeSpace(isPaid);

  const [posts, members, spaces] = await Promise.all([
    prisma.post.findMany({
      where: {
        AND: [
          {
            OR: [
              { body: { contains: term, mode: "insensitive" } },
              { title: { contains: term, mode: "insensitive" } },
            ],
          },
          { space: spaceWhere },
        ],
      },
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
        ...spaceWhere,
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
