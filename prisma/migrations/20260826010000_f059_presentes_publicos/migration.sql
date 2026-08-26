-- F059: presentes públicos + atribuição por post.

ALTER TABLE "post" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "post_slug_key" ON "post"("slug");

ALTER TABLE "membership" ADD COLUMN "origin_utm_content" TEXT;
ALTER TABLE "membership" ADD COLUMN "origin_gift_slug" TEXT;
ALTER TABLE "membership" ADD COLUMN "origin_at" TIMESTAMP(3);

CREATE TABLE "gift_visit" (
    "id" TEXT NOT NULL,
    "gift_slug" TEXT NOT NULL,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_visit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "gift_visit_utm_content_createdAt_idx" ON "gift_visit"("utm_content", "createdAt");
CREATE INDEX "gift_visit_gift_slug_createdAt_idx" ON "gift_visit"("gift_slug", "createdAt");
