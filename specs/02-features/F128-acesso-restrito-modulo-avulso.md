# F128 — Acesso restrito: comprador só do módulo avulso

## Status
Em implementação — 2026-11-27

Depende de: [F126](F126-aula-avulsa-hubla.md) (aula avulsa via Hubla),
[F127](F127-email-acesso-compra.md) (e-mail de acesso),
[F048](F048-primeiro-login-boas-vindas.md) (primeiro login em Boas-vindas).

## Contexto

Na F126, quem compra um módulo avulso e cria a conta depois nasce **free**
com o módulo liberado por cima. Ele vê tudo que o gratuito vê: feed, sete
espaços, aulas gratuitas, Método.

O **CRM com IA** é produto de entrada. Quem compra só ele deve ver **só o
módulo que comprou** e cair direto nele ao entrar. O resto fica fechado,
com convite para subir de plano.

## Regra

Uma conta tem **acesso restrito** quando as duas coisas valem:

1. ela **nasceu de uma compra de módulo avulso**: no primeiro login, o
   e-mail tinha compra em `module_purchase` e não estava na allowlist;
2. o plano dela é **free**.

Quem já tinha conta gratuita e compra o módulo **não** fica restrito:
mantém o gratuito e ganha o módulo (comportamento da F126, sem mudança).

Staff, PRO, Elite e vitalício nunca são restritos.

## Modelo

| Campo | Onde | Papel |
|-------|------|-------|
| `acesso_restrito` | `membership` (boolean, padrão `false`) | conta nasceu de compra de módulo avulso |

Gravado **uma vez**, na criação da membership (`ensureMemberBootstrap`).
Nunca é ligado depois.

- **Subiu de plano:** o campo fica como está, mas deixa de valer (regra 2).
  Se o plano voltar a free, a conta volta a ser restrita.
- **Reembolso do módulo:** a conta continua restrita, agora sem módulo.
  Não vira gratuita comum, senão o reembolso abriria mais acesso.
- **Tirar a restrição de alguém** é direto no banco por ora (sem tela no
  admin).
- **Criou a conta antes de o aviso da Hubla chegar:** nasce gratuita comum
  e ganha o módulo quando o aviso chega. Não vira restrita depois.

Contas que já existem ficam com `false`. Ninguém perde acesso na migração.

## O que a conta restrita acessa

| Rota | Acesso |
|------|--------|
| `/aulas` | catálogo: módulo comprado aberto, todos os outros com cadeado (inclusive os gratuitos) |
| `/aulas/<módulo comprado>/...` | aberto, com descendentes (F126) |
| `/planos` | aberto |
| `/perfil`, `/configuracoes` | aberto |
| todo o resto (`/`, spaces, posts, Método, notificações, nova, busca, materiais, outras aulas) | redireciona para a entrada da conta |

**Entrada da conta** (para onde ela vai ao logar e quando tenta uma rota
fechada):

- 1 módulo comprado → página desse módulo;
- mais de 1 → `/aulas`;
- nenhum (reembolsou) → `/planos`.

O redirecionamento da F048 para Boas-vindas não vale para conta restrita.

## Bloqueio no servidor

O bloqueio vale na página, não só no menu.

- `requireActiveMemberOrRedirect` passa a **negar conta restrita por
  padrão**, mandando para a entrada da conta. As páginas da tabela acima
  pedem a exceção explicitamente. Página nova nasce fechada.
- Módulo gratuito (`freeAccess`) não libera aula para conta restrita.
- Ações do servidor abertas ao gratuito (publicar, notificações, menções)
  negam conta restrita. Ficam: concluir aula do módulo comprado, perfil,
  aceites legais.

## Menu

- A barra lateral mostra só **Aulas** aberta. Os outros itens aparecem com
  cadeado e abrem o convite de upgrade.
- O convite fala em subir para o **Elite** (a página de planos mostra só o
  Elite, F114).
- Faixas do topo (Black, Imersão, Bastidores) e o banner de Boas-vindas
  continuam aparecendo: são venda.

## Fora do escopo

- Restringir quem já tinha conta gratuita.
- Tela no admin para ligar a restrição em alguém.
- Proteger o arquivo em `public/materiais/` e o vídeo no Panda (etapa 5 do
  plano).
- Entrada por produto para PRO (cair em Aulas).

## Critérios

- [ ] Compra do CRM + primeiro login com e-mail novo: cai na página do módulo
- [ ] Conta restrita abrindo `/`, um space, um post ou `/metodo` volta para o módulo
- [ ] Conta restrita abrindo aula de módulo gratuito ou pago pelo endereço é bloqueada
- [ ] `/aulas` mostra só o módulo comprado aberto
- [ ] Conta gratuita antiga que compra o CRM mantém feed, espaços e aulas gratuitas
- [ ] Conta restrita que vira PRO ou Elite abre tudo do plano
- [ ] Reembolso do módulo: conta restrita cai em `/planos`, sem aulas
- [ ] Ação de publicar chamada direto por conta restrita é negada
- [ ] Nenhuma conta existente muda de acesso com a migração
