# 01 — Modelo de domínio

Linguagem ubíqua do Builders Club. **Não** usar termos do Orion (Lead,
Diagnóstico, Outreach, Entregável — este último só na Fase 2 de migração).

## Entidades de auth (infra)

| Termo | Significado |
|-------|-------------|
| **Usuário** | Conta Better Auth (`User`). Infra, não domínio de comunidade. |
| **Sessão** | Vínculo autenticado com o app. |

## Entidades de domínio

| Termo | Significado |
|-------|-------------|
| **Membro** | Usuário com membership na comunidade. |
| **Membership** | Estado de acesso: `pending` \| `active` \| `revoked` + papel + **tier** `free` \| `pro` \| `elite` (`paid` legado = PRO; F041/F053). |
| **Allowlist** | E-mails pré-aprovados (`AllowedEmail`); login → `active` (F012). |
| **Tentativa recusada** | Pedido de entrada com e-mail **fora** da allowlist (`DeniedLoginAttempt`). Não bloqueia o login free (F041); alimenta a aba Admin (F054). |
| **Papel (Role)** | `member` \| `instructor` \| `admin`. |
| **Perfil** | Foto, nome de exibição, bio, data de entrada. |
| **Space** | Categoria de discussão (Avisos, Geral, …). |
| **Post** | Publicação num Space (texto + mídia opcional). |
| **Presente** | Post do space `presentes` com `slug` preenchido. Leitura **pública** em `/presentes/[slug]`; lista logada em `/spaces/presentes` (F059). |
| **Comentário** | Resposta a um Post (1 nível no MVP). |
| **Reação** | Curtida/reação a Post ou Comentário. |
| **Notificação** | Aviso in-app (comentário, reação, resposta, menção). E-mail agrupado de resposta: F072. |
| **Entrada (CS)** | Relógio da reunião de CS (F057): compra (allowlist Hubla/TMB/Orion) para pagante; primeiro login para Free. Recorte ≥ 2026-08-24. |
| **Ativação pagante** | Post com link público no Desafio Projetos (`projetos`) em até 7 dias da entrada (F057). |
| **Ativação Free** | Primeira busca (coleta de Lead) no Orion em até 3 dias da entrada (F057). |

## Spaces iniciais (seed)

| Slug | Nome |
|------|------|
| `avisos` | Avisos |
| `presentes` | Presentes |
| `geral` | Geral |
| `duvidas` | Dúvidas |
| `freelas` | Indicação Freela |
| `conquistas` | Conquistas |
| `projetos` | Desafio Projetos |

> `vagas` removido — prospecção de oportunidades fica no Orion Lead Hunter.

## Regras

- Post sempre pertence a um Space.
- Feed do Space: posts fixados primeiro, depois cronológico.
- Só membership `active` consome feed / publica.
- Admin (e instructor onde especificado) modera e fixa.

## Fase 2 (contorno)

| Termo | Significado |
|-------|-------------|
| **Formação** | Módulo raiz de um produto (ex.: Fase 1 da jornada, IA e Automações). |
| **Módulo** | Agrupamento de aulas ou de submódulos. Pode ter `parentId` (F050). `freeAccess` (F065) libera o ramo para o membro free assistir. |
| **Submódulo** | Módulo interno (pasta da Panda) dentro de um módulo. |
| **Aula** | Lição com referência Panda Video (`videoExternalId`, `libraryId`). |
