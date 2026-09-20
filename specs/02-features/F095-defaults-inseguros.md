# F095 — Defaults inseguros: fechar o que falha aberto

## Status
Em implementação — 2026-09-20

Não depende de feature nenhuma. Toca configuração e dois arquivos de
infraestrutura; nenhuma regra de produto muda.

## Contexto

Auditoria de *defaults inseguros* em `src/` e na configuração, em 20/09/2026.
A pergunta da auditoria é uma só: **faltando a variável de ambiente, o que
acontece?** Config que falha aberta é a classe de bug que não aparece em
teste — tudo funciona, e funciona demais.

A maior parte do repositório já responde certo. `loadAuthEnv` lança sem
`BETTER_AUTH_SECRET`; os crons devolvem 503 sem `CRON_SECRET`; os webhooks da
Hubla e da TMB devolvem 503 sem token e comparam com `timingSafeEqual`; as 19
server actions de `src/actions/admin.ts` abrem com `requireAdmin()`. Esta spec
cuida dos quatro pontos que destoam.

## Decisões

### 1. Página autenticada não leva `Cache-Control: public`

`next.config.ts` mandava, para `/aulas/:path*`:

```
public, max-age=86400, stale-while-revalidate=604800
```

E `/aulas/[moduleSlug]/[lessonSlug]` é personalizada por membro: o `embed` do
Panda só é montado quando `canWatchLesson(isPaid, …)`, e a página ainda carrega
`getLessonProgress(member.user.id)`, `isAdmin` e a discussão com `viewerId`.

O agravante está escrito no comentário de `src/lib/auth/index.ts`: *"RSC
sozinho não consegue Set-Cookie"*. Sem `Set-Cookie` na resposta, some a
heurística que normalmente impede um CDN de guardar resposta autenticada. Uma
resposta de aluno Elite fica elegível para ser servida a outra pessoa por 24h,
com mais 7 dias de `stale-while-revalidate`.

A regra que fica: **header de cache casa por path, autenticação não.** Enquanto
a rota renderizar qualquer coisa derivada da sessão, o cache é `private`. O
ganho de performance que motivou o header continua de pé por outro caminho —
`listPublishedModules` já usa `unstable_cache` com `revalidate: 120` e tag
`aulas`, que cacheia o **dado** (igual para todo mundo) e não o HTML do membro.

### 2. Guard de env é `if (!env) 503`, nunca `if (env && …)`

`src/app/api/perf/timings/route.ts` fazia:

```ts
const secret = process.env.PERF_DIAG_SECRET?.trim();
if (secret && h.get("x-perf-secret") !== secret) return 403;
```

Sem a env, `secret` é `undefined`, a condição inteira é falsa e a requisição
passa. O guard é opt-in: ele só existe se alguém lembrar de configurar.

Passa a seguir o padrão que os crons já usam (`src/app/api/cron/regua/route.ts`):
503 quando a env falta, e `timingSafeEqual` na comparação em vez de `!==`.

O endpoint continua exigindo sessão depois disso — o que muda é que deixa de
depender de uma env opcional para ter qualquer proteção.

### 3. `/_next/image` deixa de ser proxy aberto — sem quebrar imagem nenhuma

`remotePatterns` tinha `{ protocol: "https", hostname: "**" }`. Qualquer pessoa
podia chamar `/_next/image?url=<qualquer host>` e usar o domínio e a quota de
otimização da casa para buscar e servir imagem de fora.

O problema de simplesmente listar os hosts: as URLs vivem no **banco**
(`User.image` do Google, `Profile.avatarUrl`, `Post.imageUrl`,
`Module.coverImageUrl`, `Lesson.thumbnailUrl`), e `next/image` com host fora da
lista **lança em render** — derruba a página inteira, não degrada a imagem. Uma
capa antiga de host esquecido levaria `/aulas` junto.

Por isso a allowlist vem acompanhada de fallback. `src/lib/images/hosts.ts`
responde se um `src` é otimizável, e `SafeImage` usa `next/image` quando é e um
`<img>` comum quando não é. O proxy fecha; imagem de host inesperado continua
aparecendo, só que sem passar pelo otimizador.

A lista nasce com o que a aplicação realmente produz: blob da Vercel
(`storeUpload`), avatar do Google, Panda (Fase 2) e `localhost` em dev.

### 4. Credencial do Google pela metade é erro, não silêncio

`loadAuthEnv` montava `google` só com as duas envs presentes, e caía para
`null` caso contrário — o que apaga o login com Google sem dizer nada. Falhar
fechado está certo; falhar **calado** não. Configurar uma das duas e esquecer a
outra vira "por que ninguém entra com Google?" em produção.

Agora: nenhuma das duas, `google` é `null` (magic link e OTP seguem de pé, é
configuração legítima). Exatamente uma das duas, lança — igual ao que já
acontece com `BETTER_AUTH_SECRET`.

## O que muda

| Arquivo | Mudança |
|---|---|
| `next.config.ts` | tira o bloco de cache de `/aulas/:path*`; `remotePatterns` pela allowlist |
| `src/app/api/perf/timings/route.ts` | 503 sem `PERF_DIAG_SECRET`; `timingSafeEqual` |
| `src/lib/auth/env.ts` | `GOOGLE_*` pela metade lança |
| `src/lib/auth/env.test.ts` | novo — envs obrigatórias e as quatro combinações do Google |
| `src/lib/images/hosts.ts` | novo — allowlist e `podeOtimizarImagem` |
| `src/lib/images/hosts.test.ts` | novo — allowlist, subdomínio, host colado e URL relativa |
| `src/components/safe-image.tsx` | novo — `next/image` com fallback para `<img>` |
| `src/components/aulas-catalog.tsx` | passa a importar `SafeImage` |
| `src/components/optimized-media-image.tsx` | idem |
| `src/components/welcome-tutorial-player.tsx` | idem |

## O que esta feature não muda

- Nenhum gate de tier, preço, copy ou regra de produto
- `requireActiveMember`, `requirePaidMember`, `requireAdmin` e as server actions
- Os headers de segurança globais (`nosniff`, `Referrer-Policy`,
  `X-Frame-Options`, `Permissions-Policy`), que seguem iguais
- O `unstable_cache` de `listPublishedModules` — é ele que sustenta a
  performance de `/aulas` depois da decisão 1
- Sem migration

## Fora de escopo

- CSP (`Content-Security-Policy`). Vale uma spec própria: exige inventário de
  script de terceiro (Clarity, Panda) e provavelmente nonce no layout
- HSTS — a Vercel já manda em domínio próprio
- Rate limit nos webhooks e no `/api/upload`
- Rever o `x-hubla-token` para assinatura HMAC do corpo, se a Hubla oferecer
- Mover `/api/perf/timings` para trás de um gate de admin em vez de env

## Riscos

- **Performance de `/aulas`.** É o risco real desta spec. O header de cache
  existia por um motivo, e sai. A aposta é que o `unstable_cache` do catálogo
  segure — medir First Load e TTFB no Preview antes da main. Se cair de
  verdade, o caminho não é voltar o `public`: é `private, max-age=…`, que
  guarda no browser da pessoa sem oferecer a resposta para cache compartilhado.
- **Imagem de host fora da allowlist.** Some da otimização e passa a ir crua
  (mais bytes), mas não quebra. Conferir no Preview se alguma capa saiu do
  otimizador; se sair, o conserto é acrescentar o host à lista.
- **Login com Google em ambiente meio configurado.** Um ambiente que hoje roda
  com só uma das `GOOGLE_*` passa a não subir. É o comportamento desejado, mas
  vale conferir as envs de Preview e produção antes do merge.

## Critérios de aceitação

- [x] Spec antes do código
- [x] `/aulas/:path*` sem `Cache-Control: public`
- [x] `/api/perf/timings` devolve 503 sem `PERF_DIAG_SECRET`
- [x] `/api/perf/timings` compara o header com `timingSafeEqual`
- [x] `remotePatterns` sem `hostname: "**"`
- [x] Host fora da allowlist decidido antes do `next/image` (`podeOtimizarImagem`)
- [x] `GOOGLE_CLIENT_ID` sem `GOOGLE_CLIENT_SECRET` (e vice-versa) lança
- [x] Nenhuma das duas segue válido — magic link e OTP de pé
- [x] `npx tsc --noEmit` limpo
- [x] `npm test` verde, com os testes novos
- [x] `npm run build` compila
- [ ] Conferir no browser que capa e avatar continuam aparecendo
- [ ] Preview / HML antes de produção, medindo `/aulas`

## Verificação

- `npx tsc --noEmit`: limpo.
- `npm test`: 150 passando, 16 deles novos (9 de `hosts.ts`, 7 de `env.ts`).
- `npx next lint`: sem warning nos arquivos desta feature.
- `npm run build`: compila, 23 páginas. Vale registrar o que a tabela de rotas
  mostra: **`/aulas`, `/aulas/[moduleSlug]` e `/aulas/[moduleSlug]/[lessonSlug]`
  saem como `ƒ` (server-rendered on demand)** — é a confirmação de que a
  resposta era montada por requisição, com dados do membro, e ainda assim ia
  com `Cache-Control: public`.
- O build precisou de `rm -rf .next` antes: o cache de webpack de outro branch
  quebrava em `WasmHash._updateWithBuffer`. Não tem relação com a mudança.

### O que **não** foi verificado

- **Render das imagens no browser.** O caminho do fallback está coberto por
  teste unitário (`podeOtimizarImagem`), mas ninguém abriu `/aulas` e
  `/` para ver capa, thumbnail e avatar aparecendo. É o primeiro item do
  Preview.
- **Latência de `/aulas` sem o cache.** É o risco principal e só se mede em
  Preview, com dado real.
- **Envs de Preview e produção.** Se algum ambiente tiver só uma das
  `GOOGLE_*`, agora o app não sobe. Conferir antes do merge.
