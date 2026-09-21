# F096 — Rate limit no envio de e-mail de login

## Status
Rascunho — 2026-09-20

Nasce da varredura de segurança de 20/09/2026, a mesma que gerou a
[F095](F095-defaults-inseguros.md). Não depende dela.

Continua a linha da [F021](F021-hardening-seguranca.md), que tratou open
redirect, token de webhook e headers — mas não chegou a abuso por volume.

## Contexto

O envio de magic link é público por definição — é assim que a pessoa entra sem
senha. Hoje não há contador nenhum entre o pedido e o disparo: chega um e-mail
qualquer em `/api/auth/sign-in/magic-link`, `sendMagicLink` chama
`sendMagicLinkEmail` e o Resend manda.

Quem quiser roda um laço e a vítima recebe cinco mil e-mails "Entre no Builders
Club". O atacante não precisa de conta, não precisa estar na `AllowedEmail`,
não precisa de nada.

**O estrago não é o servidor cair — é a reputação de entrega.** A pessoa marca
como spam, o Gmail aprende que o domínio manda e-mail não solicitado em volume,
e a régua de 48h, os avisos de live e as notificações de resposta de *todo
mundo* passam a cair na caixa de spam. Perde-se o canal de e-mail inteiro por
causa de um endpoint aberto. Some o custo no Resend e o fato de a marca virar
ferramenta de assédio contra terceiros.

É o único dano desta varredura que é **externo e não se desfaz com um deploy**:
reputação de domínio leva semanas para voltar.

### O que já existe

O Better Auth 1.6.23 traz rate limit próprio, e ele **já está ligado em
produção** — o default é `enabled: isProduction`, `window: 10`, `max: 100`.
Nunca foi configurado aqui, então vale o default. O problema é o storage:

```js
storage: options.rateLimit?.storage || (options.secondaryStorage ? "secondary-storage" : "memory")
```

Memória. Na Vercel cada instância tem o seu `Map`, e um atacante que cai em
instâncias diferentes nunca encontra o mesmo contador. A proteção existe no
papel e quase não existe na prática.

## Decisões

### 1. Duas camadas, porque são dois ataques diferentes

O Better Auth limita por **IP + rota**. Isso freia o script ingênuo rodando de
uma máquina só.

Mas o ataque que queima a reputação do domínio é por **destinatário**: cinco mil
pedidos para `vitima@gmail.com` vindos de IPs diferentes. Cada IP passa
folgado no limite, e a vítima recebe tudo. Limite por IP não resolve isso, e é
justamente esse o caso que dói.

| Camada | Chave | Freia | Onde |
|---|---|---|---|
| 1 | IP + rota | script de uma máquina | Better Auth, `customRules` |
| 2 | e-mail de destino | ataque distribuído | `src/lib/`, antes de enviar |

A camada 2 é onde está o valor. A 1 vem praticamente de graça e some o ruído
antes de chegar na 2.

### 2. Storage no Postgres, sem lib nova

`storage: "database"` faz o Better Auth usar o adapter que já existe — o mesmo
`prismaAdapter` da sessão. Exige um model `RateLimit` (campos `key`, `count`,
`lastRequest`) e uma migration.

Isso mantém a regra da casa de pé: **sem nova lib, logo sem ADR**. Redis ou
Upstash resolveriam também, e seriam mais rápidos, mas custam uma dependência,
uma conta, uma env e um ADR — para um volume de login que não chega perto de
justificar. Se um dia o tráfego justificar, a troca é uma linha, porque o
Better Auth aceita `secondary-storage`.

O backend de banco já faz prune sozinho das linhas vencidas
(`deleteMany` por `lastRequest < cutoff`), então não nasce lixo acumulando.

### 3. A camada 2 guarda hash do e-mail, não o e-mail

A contagem por destinatário precisa registrar endereços que **não são da
base** — justamente os de vítimas de spam. Gravar isso em claro seria criar um
cadastro de e-mail de terceiro que nunca pediu nada, o oposto do que a
[F020](F020-termos-privacidade-lgpd.md) estabelece.

Então a chave é `HMAC-SHA256(BETTER_AUTH_SECRET, "f096:" + email normalizado)`,
mesmo padrão já usado em `src/lib/notifications/email-token.ts`. Dá para contar
e comparar sem nunca ter o endereço no banco.

`DeniedLoginAttempt` continua gravando e-mail em claro e está certo: ali o dado
é de quem tentou entrar no produto, é a própria razão da tabela, e a retenção é
decisão de produto. Aqui não — aqui o endereço é de quem foi alvo.

### 4. Os limites

| O quê | Janela | Máximo | Por quê |
|---|---|---|---|
| Magic link / OTP, por e-mail de destino | 1 hora | 3 | pessoa legítima pede uma ou duas vezes; 3 já é folga |
| Magic link / OTP, por e-mail de destino | 24 horas | 10 | teto para quem passa o dia reenviando |
| Rotas de envio, por IP | 10 min | 5 | o mesmo IP pedindo para vários e-mails |
| Demais rotas `/api/auth/*` | 10 s | 100 | default do Better Auth, mantido |

Números escolhidos para não aparecer para ninguém: o limite que incomoda quem
está tentando entrar é pior que o problema. Se o suporte reclamar, sobe.

### 5. Estourar devolve 429, e isso não vaza nada

O limite conta **pedidos para um endereço**, independentemente de o endereço
existir na base. Então um 429 não diz se a conta existe — a resposta é a mesma
para e-mail cadastrado e para e-mail que nunca vimos.

Isso preserva a propriedade que o login já tem hoje: a tela responde igual nos
dois casos, e é `recordDeniedLoginIfUnauthorized` que registra a tentativa do
lado de dentro, sem contar nada para fora.

### 6. A camada 2 mora em `src/lib/`, sem Next

`src/lib/seguranca/limite-envio.ts`, testável com `node:test` como o resto.
O `sendMagicLink` e o `sendVerificationOTP` consultam antes de chamar o envio.
Mesma escolha da [F077](F077-cta-imersao-no-presente.md) para `imersao-ia.ts`:
regra de domínio não mora no `.tsx` nem no route handler.

## O que muda

| Arquivo | Mudança |
|---|---|
| `prisma/schema.prisma` | novo model `RateLimit` (`key`, `count`, `lastRequest`) |
| `prisma/migrations/…_f096_rate_limit/` | nova migration |
| `src/lib/auth/index.ts` | `rateLimit: { storage: "database", customRules }`; consulta do limite em `sendMagicLink` e `sendVerificationOTP` |
| `src/lib/seguranca/limite-envio.ts` | novo — hash da chave, contagem por janela, decisão |
| `src/lib/seguranca/limite-envio.test.ts` | novo — janela, virada, teto diário, hash estável |

## O que esta feature não muda

- O fluxo de login: quem pede uma vez continua recebendo na hora
- `allowedAttempts: 3` do OTP, que é outro limite (tentativa de *acertar* o
  código, não de disparar o envio)
- `recordDeniedLoginIfUnauthorized` e a `AllowedEmail`
- Nenhum gate de tier, preço ou copy

## Fora de escopo

- **`/api/upload`** — dano é custo de blob, reversível, e só membro com
  membership ativa alcança. Entra numa próxima se o custo aparecer.
- **`/api/video/play`** — escreve no banco a cada beacon, mas exige sessão e o
  volume é proporcional a quem assiste. Mesma conversa.
- **Webhooks Hubla/TMB** — já exigem token com `timingSafeEqual`; limitar por
  IP arriscaria recusar retentativa legítima do gateway.
- **Comentários e posts** — abuso ali é visível e moderável, diferente de
  e-mail, que sai antes de alguém ver.
- **CAPTCHA no login.** Resolve o mesmo problema e cobra atrito de todo mundo.
  Só se o rate limit não segurar.
- Trocar o storage por Redis/Upstash — exigiria ADR, e o volume não pede.

## Riscos

- **Latência em `/api/auth/*`.** Sai de um `Map` e vai para o Postgres: mais uma
  ida ao banco por request nessas rotas. O hot path do app não passa por lá (o
  `cookieCache` de 5 min segura a sessão no RSC), então o custo fica no login.
  Medir antes e depois no Preview.
- **Limite apertado demais vira chamado de suporte.** O pior desfecho é alguém
  legítimo sem conseguir entrar. Por isso 3/hora e não 1/hora, e por isso os
  números ficam em constante nomeada, fáceis de subir sem caçar no código.
- **Migration em produção.** Regra da casa: só via `main` com confirmação
  explícita. A tabela nasce vazia e nada depende dela para o app subir.
- **A camada 2 sozinha não cobre reenvio legítimo em massa.** Se a casa um dia
  disparar magic link em lote (convite para turma nova), isso bate no mesmo
  limite. Não existe esse fluxo hoje; se existir, precisa de caminho próprio,
  não de afrouxar o limite público.

## Critérios de aceitação

- [ ] Spec antes do código
- [ ] Model `RateLimit` no schema, com migration aplicada em staging
- [ ] `rateLimit.storage: "database"` configurado no Better Auth
- [ ] Contador sobrevive a troca de instância (não é mais `Map` em memória)
- [ ] 4º pedido de magic link para o mesmo e-mail em 1 hora devolve 429
- [ ] 11º pedido em 24 horas devolve 429
- [ ] O e-mail **não** aparece em claro na tabela — só o HMAC
- [ ] 429 é idêntico para e-mail cadastrado e não cadastrado
- [ ] Primeiro pedido de quem nunca pediu continua chegando na hora
- [ ] `npx tsc --noEmit` limpo
- [ ] `npm test` verde, com os testes de janela e virada
- [ ] `npm run build` compila
- [ ] Latência de `/api/auth/*` medida antes e depois
- [ ] Preview / HML antes de produção

## Verificação

A preencher.
