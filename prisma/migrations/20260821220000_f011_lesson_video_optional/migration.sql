-- F011: aula só de material (sem player Panda)
ALTER TABLE "lesson" ALTER COLUMN "pandaVideoExternalId" DROP NOT NULL;
ALTER TABLE "lesson" ALTER COLUMN "pandaLibraryId" DROP NOT NULL;
