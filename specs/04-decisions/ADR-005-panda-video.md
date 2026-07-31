# ADR-005 — Panda Video (Fase 2)

## Status
Aceito (escopo Fase 2) — 2026-07-31

## Contexto
Área de aulas precisa de hosting/player de vídeo sem reinventar CDN.

## Decisão
**Panda Video** como provider. Persistimos `videoExternalId` + `libraryId`
(pullzone) por Aula. Playback via iframe embed
`https://player-vz-…/embed/?v={videoExternalId}` e, se necessário, Player API
(`api.v2.js`) para progresso.

Admin cadastra IDs; não fazemos upload de vídeo no app no MVP Fase 2.

## Alternativas
- YouTube/Vimeo — menos controle de acesso/marca.
- Mux/Cloudflare Stream — outro vendor; time já usa Panda.

## Consequências
Acoplamento ao formato de IDs Panda; progresso opcional via eventos do player.
Implementação só na Fase 2 (ver `specs/02-features/F011-aulas-panda-video.md`).
