# F082 — Botão flutuante: grupo WhatsApp de avisos das lives

## Status
Implementada no código — 2026-09-08 · **só HML / `feature/preview`** até existir o
link definitivo do grupo.

## Objetivo
Chamar o membro para entrar no grupo/comunidade de WhatsApp onde saem os
avisos das lives semanais (24h e 1h antes — programados **dentro** do WhatsApp
pelo time, não pelo app).

Presença na live é métrica de entrega e engajamento; o botão é o primeiro
passo de automação do lado do Club (descoberta do canal). E-mail de lembrete
já existe em [F079](F079-aviso-live-faixa-agenda-email.md).

## Relação com F079 / “F080”

F079 reservava WhatsApp como F080 com telefone do aluno + provedor + ADR.
Este ticket é **outro desenho**, mais barato: convite por link de grupo, sem
coleta de telefone no Club. ID **F082** (F080 no código já é `video_play`).

## O que fazer

1. **FAB** fixo canto inferior direito na área logada (`AppShell`), abaixo/
   empilhado com o FAB de “Nova publicação” quando os dois aparecem.
2. Copy curta convidando a entrar no grupo de avisos das lives.
3. Link controlado por env **`NEXT_PUBLIC_WHATSAPP_AVISOS_LIVE_URL`**.
   - Vazio / ausente → botão **não renderiza**.
   - Só preencher no ambiente **Preview (HML)** enquanto o Bruno não entregar
     o link definitivo; Production fica sem a variável → botão some mesmo se
     o código um dia estiver em `main`.
4. Abre em nova aba (`target="_blank"`, `rel="noopener noreferrer"`).
5. Visível para **qualquer membro active** (free e pago): no momento free e
   pago podem participar da live ao vivo; gravação continua benefício pago
   (fora do escopo deste FAB).

## Fora de escopo

- Enviar WhatsApp pelo app / provedor / telefone no perfil
- Mudar regra da faixa Elite / cron de e-mail (F079)
- Tela de admin para o link (env basta)
- Merge em `main` / Production **antes** do link oficial

## Critérios de aceite

- [x] Com a env preenchida no Preview: FAB visível bottom-right na comunidade
- [x] Sem a env: nenhum botão
- [x] Clique abre o link do grupo em nova aba
- [x] Não cobre o FAB de nova publicação (empilhados)
- [x] Código só em `feature/preview` até liberação explícita pra prod

## Envs

| Variável | Preview (HML) | Production |
|----------|---------------|------------|
| `NEXT_PUBLIC_WHATSAPP_AVISOS_LIVE_URL` | URL do convite (placeholder ok p/ QA) | **não definir** até o link oficial |
