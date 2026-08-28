-- F065: free assiste o ramo marcado (herança pela árvore).
ALTER TABLE "module" ADD COLUMN IF NOT EXISTS "freeAccess" BOOLEAN NOT NULL DEFAULT false;

UPDATE "module"
SET "freeAccess" = true
WHERE slug = 'fase-1-do-zero-ao-primeiro-sim';
