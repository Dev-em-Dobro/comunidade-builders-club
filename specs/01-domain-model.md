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
| **Membership** | Estado de acesso: `pending` \| `active` \| `revoked` + papel. |
| **Allowlist** | E-mails pré-aprovados (`AllowedEmail`); login → `active` (F012). |
| **Papel (Role)** | `member` \| `instructor` \| `admin`. |
| **Perfil** | Foto, nome de exibição, bio, data de entrada. |
| **Space** | Categoria de discussão (Avisos, Geral, …). |
| **Post** | Publicação num Space (texto + mídia opcional). |
| **Comentário** | Resposta a um Post (1 nível no MVP). |
| **Reação** | Curtida/reação a Post ou Comentário. |
| **Notificação** | Aviso in-app (comentário, reação, resposta). |

## Spaces iniciais (seed)

| Slug | Nome |
|------|------|
| `avisos` | Avisos |
| `geral` | Geral |
| `duvidas` | Dúvidas |
| `freelas` | Freelas |
| `conquistas` | Conquistas |
| `projetos` | Projetos |

> `vagas` removido — prospecção de oportunidades fica no Orion Lead Hunter.

## Regras

- Post sempre pertence a um Space.
- Feed do Space: posts fixados primeiro, depois cronológico.
- Só membership `active` consome feed / publica.
- Admin (e instructor onde especificado) modera e fixa.

## Desafio (F050)

| Termo | Significado |
|-------|-------------|
| **Desafio** | Programa de 45 dias para o primeiro cliente; turma única com datas fixas. |
| **Participação** | Inscrição de um membro pago no Desafio (`ChallengeEnrollment`). |
| **Fase** | Etapa do Desafio por objetivo (Rede quente, Volume, Manter aquecido, Fechar). Não confundir com "Fase 2" de produto abaixo. |
| **Semana do desafio** | Terça a segunda; S1 = 1–7/12. |
| **Missão** | Tarefa do dia no calendário do Desafio. |
| **Meta / Marco** | Mínimo semanal; marco = todas as metas da semana + check-in. |
| **Contato quente** | Pessoa ou negócio próximo, registrado na comunidade (`WarmContact`). Não é "Lead". |
| **Abordagem** | Primeira mensagem individual enviada a um contato. |
| **Retorno** | Mensagem seguinte ao mesmo contato. |
| **Abordagem fria** | Envio registrado no Orion; lido por integração, nunca cadastrado no Club. |
| **Check-in** | Formulário semanal (segunda) com "onde travou". |
| **Pontos / Selo / Ranking** | Gamificação calculada a partir das ações do membro. |

## Fase 2 (contorno)

| Termo | Significado |
|-------|-------------|
| **Módulo** | Agrupamento de aulas. |
| **Aula** | Lição com referência Panda Video (`videoExternalId`, `libraryId`). |
