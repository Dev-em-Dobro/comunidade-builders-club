# PRD - MVP Plataforma da Comunidade (Builders Club)

## Visão Geral

Desenvolver uma plataforma própria para centralizar a comunidade da Dev em
Dobro (Builders Club) em um único ambiente, proporcionando uma experiência
semelhante ao Circle, com foco em simplicidade, organização e interação entre
os membros.

Hoje a comunicação é via WhatsApp. O objetivo é migrar engajamento e
comunicados para a plataforma, sem acoplar autenticação ao Orion Lead Hunter
(contas independentes).

O MVP é entregue em **duas fases**:

| Fase | Escopo |
|------|--------|
| **Fase 1** | Auth, perfil, feed, spaces, posts fixados, busca, notificações in-app, admin |
| **Fase 2** | Área de aulas (Panda Video) + migração dos entregáveis do Orion |

---

# Objetivos

- Centralizar a comunidade em uma única plataforma.
- Melhorar a interação entre alunos.
- Facilitar a divulgação de comunicados.
- Organizar as discussões por categorias (Spaces).
- (Fase 2) Centralizar o acesso às aulas.
- Criar uma base sólida para evolução futura.

---

# Público-alvo

- Alunos da Dev em Dobro (membros)
- Instrutores
- Administradores da plataforma

---

# Escopo — Fase 1 (Comunidade)

## 1. Autenticação

- Login com **Google OAuth** (principal) + **magic link** por e-mail
- **Sem senha** (sem cadastro com senha, sem recuperação de senha)
- Sessão persistente (cookie)
- Logout

Contas **independentes** do Orion Lead Hunter (mesmo provedor Better Auth, bases separadas).

## 2. Perfil do usuário

Cada membro possui:

- Foto
- Nome
- Bio (opcional)
- Data de entrada na comunidade

Acesso ao feed exige membership `active` (admin ativa membros no MVP).

## 3. Feed da Comunidade

Inspirado no Circle. Cada postagem poderá conter:

- Texto
- Imagem
- Link
- Vídeo (URL)

### Interações

- Curtidas/Reações
- Comentários (1 nível no MVP)
- Contador de comentários
- Contador de reações

## 4. Categorias (Spaces)

As postagens pertencem a uma categoria. Categorias iniciais:

- Avisos
- Geral
- Dúvidas
- Indicação Freela
- Conquistas
- Desafio Projetos

> Space **Vagas** fora do escopo da comunidade — prospecção fica no Orion Lead Hunter.

Cada categoria possui seu próprio feed.

## 5. Postagens Fixadas

Administradores podem fixar uma publicação no topo de cada categoria
(comunicados, regras, desafios).

## 6. Busca

Pesquisar por postagens, usuários e categorias (spaces).

## 7. Notificações (in-app + e-mail agrupado)

Receber notificações quando:

- Alguém comentar uma postagem
- Alguém reagir à postagem
- Alguém responder um comentário

In-app no MVP (persistidas e lidas no request). Sem push/tempo real.

E-mail de resposta (F073): agrupado, no máximo um envio por post a cada
2 horas, só para comentário / resposta / menção. Reação não gera e-mail.

## 8. Administração

O administrador poderá:

- Criar / editar / remover categorias (spaces)
- Criar e fixar postagens
- Remover postagens e comentários
- Ativar / desativar membership de membros

---

# Escopo — Fase 2 (Aulas)

- Área de aulas com catálogo (módulos / lições).
- Player via **Panda Video** (embed + Player API para progresso).
- Admin cadastra / edita aulas (`pandaVideoId`, `libraryId`).
- Migrar entregáveis do Orion (F020) para a comunidade; cutover no Orion após validação.

---

# Requisitos Não Funcionais

## Interface

Inspirada no Circle: simples, minimalista, foco na leitura, mobile first,
navegação intuitiva. Visual **distinto** do Orion Lead Hunter.

## Performance

- Feed rápido (paginação ou scroll infinito)
- Lazy loading de imagens
- Cache das consultas principais quando fizer sentido

## Segurança

- Autenticação segura (Better Auth)
- Controle de permissões (member / instructor / admin)
- Validação de uploads e inputs (Zod)

## Ambientes

- Staging (`feature/preview`) + Produção (`main`), projeto Vercel separado do Orion
- Neon staging / produção; migrations só em staging até validar

---

# Diferenciais

- Interface inspirada no Circle
- Organização por Spaces
- (Fase 2) Comunidade e aulas centralizadas
- Experiência limpa e intuitiva
- Stack alinhada ao Orion (Next.js, Prisma, Neon, Better Auth), produto independente

---

# Roadmap (fora do MVP)

## Comunidade

- Resposta aninhada em comentários
- Marcação de usuários (@usuario)
- Favoritar / compartilhar posts
- Editor rico (Markdown)
- Enquetes
- Upload de arquivos
- Sync de acesso via Hubla

## Eventos / Gamificação / Comunicação / App

Ver roadmap original (calendário, badges, chat, push, dark mode, analytics).

---

# Critérios de Sucesso

## Fase 1

- Login (Google / magic link) funciona.
- Membros ativos publicam, comentam e reagem.
- Navegação entre spaces funciona.
- Notificações in-app chegam.
- Admins moderam e fixam posts.
- Experiência simples, rápida e organizada.

## Fase 2

- Consumo de aulas via Panda Video na plataforma.
- Entregáveis migrados / acessíveis na comunidade.

---

# Referência de UX

**Circle** — interface minimalista, Spaces, excelente mobile, foco na interação.
