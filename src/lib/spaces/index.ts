import { z } from "zod";
import { prisma } from "@/lib/db";

export const spaceSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Slug: minúsculas, números e hífens"),
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300).optional().nullable(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export async function listSpaces() {
  return prisma.space.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getSpaceBySlug(slug: string) {
  return prisma.space.findUnique({ where: { slug } });
}

export async function createSpace(raw: z.infer<typeof spaceSchema>) {
  const data = spaceSchema.parse(raw);
  return prisma.space.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description || null,
      sortOrder: data.sortOrder ?? 99,
    },
  });
}

export async function updateSpace(
  id: string,
  raw: Partial<z.infer<typeof spaceSchema>>,
) {
  const data = spaceSchema.partial().parse(raw);
  return prisma.space.update({
    where: { id },
    data: {
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined
        ? { description: data.description || null }
        : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
    },
  });
}

export async function deleteSpace(id: string) {
  return prisma.space.delete({ where: { id } });
}
