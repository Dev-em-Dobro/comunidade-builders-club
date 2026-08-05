# ADR-008 — Upload de mídia com Vercel Blob

## Status
Aceito — 2026-08-05

## Contexto
Posts precisam de upload de imagem/vídeo do computador (não só URL).
Armazenar binários no Postgres estoura storage; filesystem local não
persiste na Vercel.

## Decisão
Usar **`@vercel/blob`** (`put`) em produção/preview com
`BLOB_READ_WRITE_TOKEN`. Em desenvolvimento **sem** token, gravar em
`public/uploads/` (gitignored).

Limites: imagens jpg/png/gif ≤ 1 MB; vídeo mp4 ≤ 50 MB.
Somente esses MIME types.

## Alternativas
- Base64 no campo `imageUrl` — rejeitado (incha o banco).
- S3/R2 próprios — overkill no momento.

## Consequências
Token Blob obrigatório na Vercel. Sem token em prod, upload falha com
mensagem clara.
