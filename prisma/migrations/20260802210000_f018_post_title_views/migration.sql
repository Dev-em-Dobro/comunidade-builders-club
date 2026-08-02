-- AlterTable
ALTER TABLE "post" ADD COLUMN "title" TEXT NOT NULL DEFAULT '';
ALTER TABLE "post" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "post_view" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_view_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_view_userId_idx" ON "post_view"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "post_view_postId_userId_key" ON "post_view"("postId", "userId");

-- AddForeignKey
ALTER TABLE "post_view" ADD CONSTRAINT "post_view_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_view" ADD CONSTRAINT "post_view_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
