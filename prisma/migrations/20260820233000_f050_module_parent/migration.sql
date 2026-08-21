-- F050: módulo interno (parentId)
ALTER TABLE "module" ADD COLUMN IF NOT EXISTS "parentId" TEXT;

CREATE INDEX IF NOT EXISTS "module_parentId_sortOrder_idx" ON "module"("parentId", "sortOrder");

ALTER TABLE "module" DROP CONSTRAINT IF EXISTS "module_parentId_fkey";
ALTER TABLE "module" ADD CONSTRAINT "module_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
