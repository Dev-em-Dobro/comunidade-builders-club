import { prisma } from "@/lib/db";
import { PRESENTES_SPACE_SLUG } from "@/lib/spaces/constants";
import { isGiftCrawler } from "./bots";
import { giftAdminLabel } from "./link";
import { sanitizeGiftSlug, sanitizeUtmValue } from "./origem";

export async function getPublicGift(slug: string) {
  const clean = sanitizeGiftSlug(slug);
  if (!clean) return null;
  return prisma.post.findFirst({
    where: {
      slug: clean,
      space: { slug: PRESENTES_SPACE_SLUG },
    },
    select: {
      id: true,
      title: true,
      body: true,
      slug: true,
      imageUrl: true,
      linkUrl: true,
      videoUrl: true,
      createdAt: true,
      space: { select: { slug: true, name: true } },
      author: {
        select: {
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
    },
  });
}

export async function listGiftPostsAdmin() {
  const rows = await prisma.post.findMany({
    where: {
      space: { slug: PRESENTES_SPACE_SLUG },
      slug: { not: null },
    },
    select: { slug: true, title: true, body: true, linkUrl: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.flatMap((r) =>
    r.slug
      ? [
          {
            slug: r.slug,
            title: r.title,
            label: giftAdminLabel({
              slug: r.slug,
              title: r.title,
              body: r.body,
              linkUrl: r.linkUrl,
            }),
            createdAt: r.createdAt,
          },
        ]
      : [],
  );
}

export async function recordGiftVisit(opts: {
  giftSlug: string;
  userAgent: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
}): Promise<void> {
  if (isGiftCrawler(opts.userAgent)) return;
  const giftSlug = sanitizeGiftSlug(opts.giftSlug);
  if (!giftSlug) return;

  await prisma.giftVisit.create({
    data: {
      giftSlug,
      utmSource: sanitizeUtmValue(opts.utmSource),
      utmMedium: sanitizeUtmValue(opts.utmMedium),
      utmCampaign: sanitizeUtmValue(opts.utmCampaign),
      utmContent: sanitizeUtmValue(opts.utmContent),
      referrer: opts.referrer?.trim().slice(0, 500) || null,
    },
  });
}
