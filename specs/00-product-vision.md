# 00 — Visão do produto

## O que é

**Builders Club** é a plataforma de comunidade dos alunos da Dev em Dobro.
Centraliza discussões, avisos e (na Fase 2) aulas num ambiente próprio,
inspirado no Circle — simples, organizado por Spaces, mobile-first.

## Por quê

Hoje toda comunicação vive no WhatsApp: difícil de organizar, buscar e
moderar. A plataforma reduz ruído, cria histórico e melhora engajamento.

## Relação com o Orion

| | Orion Lead Hunter | Builders Club |
|--|-------------------|---------------|
| Papel | Ferramenta de prospecção | Comunidade + aulas |
| Auth | Better Auth (próprio) | Better Auth (próprio, **contas separadas**) |
| Banco | Neon Orion | Neon Club (separado) |
| Deploy | Vercel Orion | Vercel Club (separado) |

Não há SSO entre os produtos no MVP. Sync de acesso via Hubla é futuro.

## Fases

1. **Comunidade** — auth, perfil, feed, spaces, reações, comentários, busca,
   notificações in-app, admin.
2. **Aulas** — catálogo + Panda Video; migração dos entregáveis do Orion (F020).

## Princípios

- Specs antes do código.
- Mobile first; feed como superfície principal.
- Visual distinto do Orion (atmosfera de comunidade, não dashboard de ops).
- Poucas libs; ADR para cada dependência nova.
