# F042 — Tema claro / escuro

## Status
Implementado

## Objetivo
Permitir que o membro alterne o visual entre tema claro e escuro, com a
preferência persistida no dispositivo. Acento teal e hierarquia atuais
permanecem ([05-design-direction](../05-design-direction.md)).

## Critérios
- [x] Botão de troca de tema no shell (sidebar desktop e header/drawer mobile)
- [x] Mesmo controle nas páginas públicas (login, aguardando, termos, privacidade)
- [x] Preferência salva em `localStorage` (`builders-club-theme`: `light` | `dark`)
- [x] Sem flash do tema errado no carregamento (script no `<html>` antes do paint)
- [x] Padrão: claro (visual atual) quando não houver preferência salva
- [x] Tokens de cor via CSS; sem nova lib

## Fora de escopo
- Preferência sincronizada na conta (servidor)
- Tema “seguir o sistema” como terceiro modo
