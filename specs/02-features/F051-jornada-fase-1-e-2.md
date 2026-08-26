# F051 — Jornada Fase 1 e Fase 2 (rascunho)

## Status
Em implementação

## Objetivo
Cadastrar a jornada linear do aluno **FASE 1 → FASE 2**.
Fonte de nomes, módulos e ordem: documento de organização das aulas
(Dev em Dobro) + pasta Panda. Fase 3 fica de fora (EM BREVE). Área de
apoio/bônus não entra nesta trilha. Preview no HML; produção só com
confirmação.

## Hierarquia

```
FASE 1 — Do zero ao primeiro sim     ← raiz (rascunho)
├── Comece por aqui                  ← M01
│   ├── Como usar a comunidade       ← 1ª aula; mesmo vídeo da Boas-vindas (F055)
│   ├── Introdução ao Builders Club
│   ├── Bem-vindo e mapa da jornada
│   └── O que você vai construir…
├── Escolha o nicho e o que vender   ← M02
├── Ache seus clientes               ← M03
├── Aborde e mande a amostra         ← M04
└── Feche seguro — o lado empresa    ← M05

FASE 2 — Entregar e ligar a recorrência
├── Entregue o site                  ← M06
├── Entregue o agente                ← M07
└── Ligue a recorrência              ← M08 (estrutura; aulas quando existirem)
```

Na plataforma o aluno vê só o **título amigável**. Sem `M02-L01` e sem
numeração antiga (`Aula 15`, `Aula 04`, …).

## Regras de cadastro

- Aula **a gravar** sem vídeo na Panda → não criar a aula — **exceto**
  aula só de material (anexo em `/materiais/`), quando pedida.
- No HML, **todos** os vídeos da pasta entram no submódulo correspondente,
  na ordem de chegada na Panda (`created_at`), com título amigável.
  Vídeos que ainda misturam assuntos ficam no catálogo de preview até a
  edição separar.
- Entregável do módulo vai na **descrição do módulo**, não como aula em vídeo.
- **HML:** jornada publicada para preview em `/aulas`. **Produção:** rascunho
  até o usuário confirmar.

## Catálogo Panda

- Jornada (Fase 1–2): pasta `ce8de2e5-0047-493a-a9ba-a19dcbc31eb6`
- M01 Comece por aqui: pasta `4bdf67e4-2ede-4495-a2dc-ff3e6fe68b20`
  (introdução + tutorial da comunidade + nivelamento)

Seed via `npm run db:seed:aulas-panda` (idempotente por slug). Padrão: HML.
Usar `video_external_id`, não o ID da URL do dashboard.

## Critérios

- [x] Fase 1 e Fase 2 existem como raízes, com M01–M08
- [x] Títulos das aulas são amigáveis (sem Mxx-Lxx nem “Aula 15”)
- [x] HML: jornada visível em `/aulas`; produção não é publicada por este seed
- [x] Fase 3 e área de apoio não são criadas nesta feature

## Dependências

F011 · F050
