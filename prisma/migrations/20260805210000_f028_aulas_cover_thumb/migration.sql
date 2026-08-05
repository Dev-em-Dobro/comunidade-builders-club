-- AlterTable
ALTER TABLE "module" ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT;

-- AlterTable
ALTER TABLE "lesson" ADD COLUMN IF NOT EXISTS "thumbnailUrl" TEXT;
