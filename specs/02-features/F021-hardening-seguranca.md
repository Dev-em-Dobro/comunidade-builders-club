# F021 — Hardening de segurança

## Status
Implementado — com **um item revertido pela F039** (ver "O que foi revertido").
Revisado em 2026-09-20 contra o código, na varredura que gerou a
[F095](F095-defaults-inseguros.md).

## Objetivo
Remediar achados da análise de segurança pré-LGPD/lançamento:
entregáveis (iframe/CSP), webhook Hubla, embeds Panda, open redirect
no login, URLs `javascript:` e demotion de admins.

## Critérios

- [ ] ~~Iframe de entregáveis sem `allow-same-origin` + CSP no serve HTML/SVG~~
      — **revertido em 10/08/2026 pela F039** (`3653aa7`). Ver abaixo.
- [x] `HUBLA_PRODUCT_ID` obrigatório; token comparado com `timingSafeEqual`
- [x] IDs Panda validados (sem host injection) — `PANDA_ID_RE` + `encodeURIComponent`
- [x] `callbackUrl` só path relativo seguro (`/` interno), aceito pelo
      Better Auth após `decodeURIComponent` no verify (sem `?` aninhado e
      sem colchetes/`%5B` de UTM)
- [x] `imageUrl` / `linkUrl` / `videoUrl` / `avatarUrl` só `https:`
      (`optionalMediaUrl` também aceita `/uploads/…`, que é da própria origem)
- [x] Admin não altera o próprio papel (`members.ts:67`; demotar outro admin:
      ver F032, com salvaguardas)
- [x] Headers de segurança básicos no `next.config` — ampliados pela F095

## O que foi revertido

O commit `3653aa7` ("F039: share link, aulas em página com comentários,
entregáveis e boas-vindas", 10/08/2026) desfez a primeira linha desta spec sem
passar por mudança de spec. Ficou assim por 41 dias até a varredura de 20/09
encontrar. O registro fica aqui porque spec que diz `[x]` para mitigação que
não existe é pior que spec sem o item — quem lê acredita estar protegido.

O que saiu, literalmente:

```diff
- sandbox="allow-scripts allow-downloads allow-popups"
+ sandbox="allow-scripts allow-same-origin allow-downloads allow-popups"

- // Sem allow-same-origin: HTML/JS não herdam a origem autenticada do app.
- headers["Content-Security-Policy"] =
-   "sandbox allow-scripts allow-downloads allow-popups allow-modals; frame-ancestors 'self'";
- headers["Content-Security-Policy"] = "default-src 'none'; sandbox";
+ // Alinhado ao Orion: sem CSP sandbox opaca — assets/JS no iframe
+ // (allow-same-origin) precisam da sessão/cookie para fetch relativo.
```

**A razão é legítima e está no código:** os entregáveis passaram a carregar
assets e JS próprios, por caminho relativo, e esses pedidos precisam do cookie
de sessão — a rota que serve o arquivo exige `membroPagoAtivo()`. Sem
`allow-same-origin` o iframe vira origem opaca, o cookie não vai junto e o
entregável não carrega. A escolha foi entregável funcionando em vez de
entregável sandboxado.

**O que isso custa:** `allow-scripts` com `allow-same-origin` no mesmo `sandbox`
anula o sandbox — conteúdo com os dois pode remover as próprias restrições. Na
prática, HTML e JS de `content/entregaveis/` rodam com a origem do app e com a
sessão do membro. Hoje o sandbox do iframe também tem
`allow-top-navigation-by-user-activation`.

## O que protege os entregáveis hoje

Como a mitigação do browser saiu, vale registrar o que sobrou — é isso que
está segurando:

| Camada | Onde |
|---|---|
| Conteúdo vem do repo, não de upload | `content/entregaveis/`, sob code review |
| Só membro pago ativo alcança | `membroPagoAtivo()` nas duas rotas |
| Não dá para sair da pasta | `caminhoSeguro` — rejeita `..`, null byte, confere containment |
| SVG não executa | `Content-Disposition: attachment` |
| Navegador não adivinha tipo | `X-Content-Type-Options: nosniff` |
| Ninguém embute de fora | `X-Frame-Options: SAMEORIGIN` global |

**O controle deixou de ser o browser e passou a ser o que entra na pasta.**
Enquanto `content/entregaveis/` só receber arquivo escrito pela casa e revisado,
o risco é baixo. Um entregável de terceiro, um asset de CDN copiado sem ler, ou
um build de fora mudam essa conta — e não haveria nada entre o JS e a sessão do
membro.

## Se for para reintroduzir

Não é só voltar o `allow-same-origin`: isso quebra os entregáveis de novo. Os
caminhos que resolvem os dois lados, em ordem de custo:

1. **CSP com allowlist em vez de `sandbox` opaca.** `default-src 'self'` no
   serve mantém o cookie funcionando e ainda barra origem externa. Não impede
   JS local de ler a sessão, mas corta exfiltração para fora.
2. **Servir entregáveis de outra origem** (subdomínio ou bucket), com URL
   assinada de vida curta em vez de cookie. Resolve de verdade e é o mais caro.
3. **Manter como está e travar a entrada** — tratar `content/entregaveis/` como
   código: sem minificado de terceiro, sem asset remoto, revisão obrigatória.
   É o estado atual, só que declarado em vez de acidental.

Qualquer um dos três exige spec própria. Esta seção existe para a próxima
pessoa não reabrir a discussão do zero.

## Arquivos principais
- `src/lib/security/urls.ts`
- `src/lib/entregaveis/servir.ts` — `caminhoSeguro`, sanitização do corpo
- `src/app/api/entregaveis/[...path]/route.ts`
- `src/app/(app)/entregaveis/[slug]/page.tsx` — o `sandbox` do iframe
- `src/app/api/webhooks/hubla/route.ts`
- `src/lib/aulas/index.ts`
- `src/lib/admin/members.ts`
- `next.config.ts`
