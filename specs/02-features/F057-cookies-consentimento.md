# F057 — Cookies: transparência e consentimento

## Status
Em desenvolvimento — 2026-08-24

## Contexto
O Club deixa de ser só para alunos: com o funil freemium (F041) entra público
que a equipe não conhece. Hoje a Política de Privacidade **não menciona
cookies** e não existe banner. O app também está prestes a ganhar pixel /
analytics para medir o funil.

## Comportamento

### O que o app usa hoje
Levantado no código, não presumido:

| Item | Tipo | Necessário? |
|---|---|---|
| Sessão do Better Auth | cookie | sim — sem ele não há login |
| Preferência de tema | `localStorage` | não é cookie; segue documentado por transparência |

Nenhum script de terceiro no `layout.tsx` (o único `<script>` é o bootstrap de
tema, inline) e nenhuma dependência de analytics no `package.json`.

### Seção de cookies na Política
Nova seção listando o que é usado, a finalidade e como recusar. Cookie
estritamente necessário não depende de consentimento prévio (LGPD art. 7º, V);
o que ele exige é informação clara.

### Banner
- Aparece quando não há decisão registrada, em qualquer página (inclusive login)
- **Recusar tem o mesmo peso visual de aceitar** — exigência da ANPD; nada de
  "Aceitar" destacado e recusa escondida em link cinza
- Link para a Política
- Decisão gravada em cookie próprio (`bc_consent`), 6 meses, `SameSite=Lax`
- Sem decisão = sem analytics. O silêncio não vale como aceite.

### Portão para o tracking futuro
`consentiuAnalytics()` é a única porta: script de analytics/pixel só entra na
página quando ela retorna `true`. Enquanto não houver tracking, o portão fica
pronto e sem nada atrás dele.

O caminho errado — subir o pixel primeiro e o banner depois — dispara tracking
sem consentimento no intervalo. Por isso o portão vem antes.

## Não faz parte
- Instalar analytics/pixel (feature própria, entra atrás do portão)
- Consentimento granular por categoria: com um cookie necessário e um grupo
  opcional, duas opções bastam

## Critérios
- [ ] Política tem seção de cookies com o que é usado hoje
- [ ] Banner aparece sem decisão registrada e some depois de decidir
- [ ] Aceitar e recusar têm o mesmo destaque
- [ ] Decisão sobrevive a recarga e a novo login
- [ ] `consentiuAnalytics()` só é `true` após aceite explícito
- [ ] Sessão do Better Auth segue funcionando com consentimento recusado
