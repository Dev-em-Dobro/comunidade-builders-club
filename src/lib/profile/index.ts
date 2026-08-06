import { z } from "zod";
import { prisma } from "@/lib/db";
import { optionalMediaUrl } from "@/lib/security/urls";

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  bio: z.string().trim().max(500).optional().nullable(),
  avatarUrl: optionalMediaUrl,
});

export async function updateProfile(
  userId: string,
  raw: z.infer<typeof updateProfileSchema>,
) {
  const data = updateProfileSchema.parse(raw);
  return prisma.profile.update({
    where: { userId },
    data: {
      displayName: data.displayName,
      bio: data.bio || null,
      avatarUrl: data.avatarUrl || null,
    },
  });
}
