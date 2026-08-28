-- F065: free só o M01 Comece por aqui (abrir o resto depois).
UPDATE "module"
SET "freeAccess" = false
WHERE slug = 'fase-1-do-zero-ao-primeiro-sim';

UPDATE "module"
SET "freeAccess" = true
WHERE slug = 'fase-1-m01-comece-por-aqui';
