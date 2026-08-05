# F032 — Papel admin nos membros (promover / remover)

## Status
Implementado

## Objetivo
Importados entram como `member`. No painel Admin → Membros dá para **tornar**
ou **remover** admin.

## Critérios
- [x] Allowlist/import não promove a admin (só `BOOTSTRAP_ADMIN_EMAIL`)
- [x] UI: “Tornar admin” / “Remover admin”
- [x] Não alterar o próprio papel
- [x] Não remover o último admin ativo
- [x] Não demotar o e-mail `BOOTSTRAP_ADMIN_EMAIL`
