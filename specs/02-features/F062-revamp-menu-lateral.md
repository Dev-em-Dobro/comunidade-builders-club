# F062 — Revamp do menu lateral (menos itens, popup do usuário)

## Status
Em desenvolvimento

## Problema
O menu lateral acumulou itens soltos no rodapé (Planos, Aulas, Busca, Orion,
Notificações, Perfil, Admin, Progresso, Tema, Sair) e a seção "Materiais de
apoio" listava uma linha por categoria. Resultado: ~18 itens visíveis, sem
hierarquia.

## Referência
Menu do Claude: pill do usuário no rodapé da sidebar, popup abrindo para cima
com e-mail no topo, itens de conta agrupados e "Sair" isolado no fim. Busca é
um ícone (lupa) ao lado da pill, não um item de lista.

## Decisões

### 1. Pill do usuário no rodapé + popup
- A pill (avatar + nome + chevron) sai do **topo** da sidebar e vai para o
  **rodapé**, como na referência.
- Clicar abre um popup **para cima** contendo, nesta ordem:
  1. E-mail do membro + `PlanBadge` (cabeçalho, não clicável)
  2. `Planos` → `/planos` (oculto para Elite, mesma regra de hoje)
  3. `Configurações` → `/configuracoes`
  4. `Tema claro` / `Tema escuro` (toggle inline, não fecha o popup)
  5. `Perfil` → `/perfil`
  6. `Sair`
- Fecha com clique fora, `Escape` ou navegação.

### 2. Busca vira ícone
- `Busca` deixa de ser item de lista e vira um botão-lupa ao lado da pill.
- Sem plano pago, a lupa continua abrindo o `UpgradeModal` (`reason: "busca"`).

### 3. Materiais de apoio: um item só
- A seção com uma linha por categoria (`/entregaveis/{slug}`) é substituída por
  **um único item** `Materiais de apoio` → `/entregaveis` (a atual "Visão geral",
  que já lista todos os materiais).
- As rotas `/entregaveis/{slug}` continuam existindo e acessíveis pela página.

### 4. Configurações (nova rota `/configuracoes`)
Página nova, agrupando o que hoje está espalhado:
- **Conta** — e-mail, membro desde, plano atual
- **Plano e pagamento** — plano atual, `Ver planos` → `/planos` e um bloco de
  **suporte**: WhatsApp e e-mail para quem precisa de ajuda com cobrança,
  troca de cartão ou cancelamento
- **Aparência** — tema claro/escuro
- **Excluir conta** — movido de `/perfil`

`/perfil` fica só com nome, bio e avatar.

> **Por que suporte e não self-service:** o checkout é da Hubla, não nosso — não
> temos como cancelar assinatura nem trocar forma de pagamento pela nossa API.
> Prometer isso na UI seria falso. A página encaminha para o atendimento humano,
> que é onde a operação realmente acontece.

Contato centralizado em `src/lib/suporte.ts` (`WHATSAPP_SUPORTE`,
`EMAIL_SUPORTE`).

**No MVP o canal é só o e-mail** (`suportedevquest@gmail.com`). O atendimento
por WhatsApp entra depois: o código já está pronto e o botão aparece sozinho
assim que `NEXT_PUBLIC_WHATSAPP_SUPORTE` for preenchida (só dígitos, com DDI).
Sem a variável, nada quebra — o e-mail é a ação principal.

## Menu resultante

```
Builders Club
  Feed
  ──────────
  SPACES
    (lista de spaces)
  ──────────
  Materiais de apoio
  ──────────
  Aulas
  Orion
  Notificações
  Admin / Progresso (admin)
  ──────────
  [avatar Nome ⌄]  [🔍]
```

## Critérios
- [ ] Pill do usuário no rodapé da sidebar, com avatar, nome e chevron
- [ ] Popup abre para cima com e-mail + plano no topo
- [ ] Popup contém Planos, Configurações, Tema, Perfil e Sair
- [ ] Popup fecha com clique fora, `Escape` e ao navegar
- [ ] `Planos` some do popup para membro Elite
- [ ] Busca é uma lupa ao lado da pill; sem plano pago abre o upgrade
- [ ] `Materiais de apoio` é um único item apontando para `/entregaveis`
- [ ] `/configuracoes` existe com Conta, Plano e pagamento, Aparência e Excluir conta
- [ ] Bloco de suporte em Configurações com e-mail como canal principal
- [ ] Botão de WhatsApp aparece sozinho quando `NEXT_PUBLIC_WHATSAPP_SUPORTE` for preenchida (fase 2)
- [ ] `Excluir conta` sai de `/perfil`
- [ ] Drawer mobile tem a mesma pill e o mesmo popup
- [ ] Rodapé some com Planos, Perfil, Tema e Sair como itens soltos
