# F059 — Exclusão de conta pelo próprio membro

## Status
Em desenvolvimento — 2026-08-24

## Contexto
A Política já promete exclusão "pelo contato abaixo" (e-mail). Com cadastro
público do freemium, atendimento manual não escala e vira risco de descumprir
prazo. O direito do titular passa a ter autoatendimento.

## Comportamento

### Anonimização, não apagamento em cascata
O schema tem `onDelete: Cascade` de `User` para posts e comentários. Apagar a
linha do usuário levaria junto conversas em que **outras pessoas**
participaram — thread de dúvida com respostas viraria buraco.

Então excluir a conta significa:

| Dado | Depois |
|---|---|
| `User.name` | "Membro removido" |
| `User.email` | `removido+<id>@invalido.local` (mantém a unicidade da coluna) |
| `User.image` | null |
| `Profile.displayName` | "Membro removido" |
| `Profile.bio` / `avatarUrl` | null |
| `Membership.status` | `revoked` |
| `Session` / `Account` | apagados — encerra o acesso e desfaz o vínculo OAuth |
| Posts, comentários, reações | **ficam**, sem dado pessoal do autor |

O dado pessoal sai, que é o que a LGPD exige; a conversa da comunidade
permanece.

### Fluxo
1. Perfil ganha uma área de exclusão, separada do resto e com aviso do que é
   irreversível
2. Confirmação por digitação (`EXCLUIR`) — não é `confirm()` do browser
3. Server Action anonimiza, revoga e encerra a sessão
4. Redireciona para a home pública com aviso de conclusão

### Guarda
Se a pessoa for o **único admin ativo**, a exclusão é bloqueada com explicação.
Comunidade sem admin não tem quem restaure acesso de ninguém.

### E-mail na allowlist
Sair da allowlist não é automático: quem comprou e excluiu a conta pode voltar.
Um novo login com o mesmo e-mail cria um `User` novo — o antigo já não tem esse
e-mail.

## Não faz parte
- Exportação/portabilidade dos dados antes de excluir (feature própria)
- Exclusão feita por admin em nome de terceiro
- Janela de arrependimento / soft delete com prazo

## Critérios
- [ ] Perfil tem exclusão com confirmação digitada
- [ ] Depois de excluir, nome e e-mail não aparecem em lugar nenhum da UI
- [ ] Posts e comentários seguem existindo, assinados como "Membro removido"
- [ ] Sessão cai na hora; login com o mesmo e-mail cria conta nova e vazia
- [ ] Único admin ativo é impedido de excluir a própria conta
