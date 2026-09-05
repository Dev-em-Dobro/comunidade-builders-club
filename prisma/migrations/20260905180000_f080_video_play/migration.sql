-- F080 — audiência de vídeo: quem deu play e até onde assistiu.
--
-- Uma linha por (pessoa, vídeo). O upsert do endpoint só sobe `segundos`,
-- nunca desce: quem assistiu 8 minutos e reabriu no começo continua com 8.

CREATE TABLE "video_play" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fonte" TEXT NOT NULL,
    "lessonId" TEXT,
    "videoId" TEXT NOT NULL,
    "segundos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_play_pkey" PRIMARY KEY ("id")
);

-- Uma linha por pessoa e vídeo: é o que faz o upsert por (userId, videoId).
CREATE UNIQUE INDEX "video_play_userId_videoId_key" ON "video_play"("userId", "videoId");

-- O relatório pergunta "quantos deram play no vídeo de boas-vindas nos últimos
-- N dias" — este índice é exatamente essa consulta.
CREATE INDEX "video_play_fonte_createdAt_idx" ON "video_play"("fonte", "createdAt");

ALTER TABLE "video_play" ADD CONSTRAINT "video_play_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
