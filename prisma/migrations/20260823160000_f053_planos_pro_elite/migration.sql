-- F053: planos PRO e Elite. `paid` legado permanece no enum e no dado
-- (capabilities trata como pro). Novos grants usam pro | elite.
ALTER TYPE "MembershipTier" ADD VALUE IF NOT EXISTS 'pro';
ALTER TYPE "MembershipTier" ADD VALUE IF NOT EXISTS 'elite';
