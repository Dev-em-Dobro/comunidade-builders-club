# F123 — Simular login no admin

## Status
Implementado — 2026-10-29 (migration HML aplicada; validação manual no admin)

## Contexto

Admins precisam validar o que o membro vê (badge Vitalício, gates PRO/Elite,
perfil) sem pedir a senha. A lista em `/admin?tab=membros` ganha **Simular
login**: o admin passa a navegar como aquele usuário e pode **parar** a
qualquer momento.

Auth = Better Auth. Impersonação via plugin oficial `admin` (mesma lib; sem
ADR de lib nova). O papel operacional da comunidade continua em
`Membership.role`; o plugin exige `User.role` — sync explícito.

## Comportamento

| Quem | Pode |
|------|------|
| Admin (`Membership.role = admin` **e** `User.role = admin`) | Clicar “Simular login” |
| Alvo | Qualquer membro com conta, **exceto** outros admins |
| Durante a simulação | App inteiro como o alvo (capabilities do Membership dele) |
| Sair | Banner “Parar simulação” → restaura sessão do admin |

- Duração da sessão simulada: **1 hora** (`impersonationSessionDuration`)
- Após simular → redirect `/perfil`
- Após parar → redirect `/admin?tab=membros`
- `session.impersonatedBy` guarda o `userId` do admin

### Sync de papéis

- Ao promover/rebaixar em `setMembershipRole`: atualiza também `user.role`
  (`admin` | `user`)
- Bootstrap `BOOTSTRAP_ADMIN_EMAIL`: seta `user.role = admin`
- Migration backfill: memberships admin → `user.role = admin`

## Critérios

- [ ] Admin vê botão “Simular login” na lista de membros (não-admin)
- [ ] Simular troca a sessão; perfil/gates refletem o membro
- [ ] Banner visível durante a simulação com ação “Parar”
- [ ] Não é possível simular outro admin
- [ ] Membership continua fonte de capabilities (pago/elite/vitalício)

## Fora de escopo

- Orion
- Impersonar admin
- Auditoria persistida (só `console` se útil)
- UI de ban do plugin admin
