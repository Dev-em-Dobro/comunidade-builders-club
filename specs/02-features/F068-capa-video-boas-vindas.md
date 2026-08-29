# F068 — Capa com play no vídeo de boas-vindas

## Status
Em implementação — 2026-08-28

## Objetivo

No space **Boas-vindas**, o player do tutorial ([F023](F023-boas-vindas-feed-modal.md)
/ [F055](F055-boas-vindas-trilha.md) / [F058](F058-boas-vindas-video-por-tier.md))
entra como um retângulo preto do Panda. Não parece vídeo, parece área que
falhou ao carregar — e é a primeira coisa que o membro novo vê depois do
cadastro.

Entra uma **capa da marca com botão de play**: dá para entender em um
relance que ali tem vídeo, e quem clica já entra tocando.

## Comportamento

O player vira uma **fachada**: até o clique, só a capa. No clique, o
iframe do Panda monta no lugar, com `autoplay`.

| Estado | O que aparece |
|---|---|
| Antes do clique | Capa 16:9 + botão de play centralizado |
| Depois do clique | Iframe do Panda tocando, no mesmo espaço |

Sem clique, **nenhum** iframe é montado — o embed do Panda deixa de pesar
no carregamento do primeiro acesso.

Continua valendo o **um iframe por visita** da F058: a fachada não
duplica o player, substitui.

## Capa

Arquivo único, versionado em `public/boas-vindas-capa.webp` — arte
"Sua jornada pra faturar com IA", 1600×900 (16:9), 88 KB. Mesma capa para
free e pago: o **vídeo** muda por plano (F058), a capa não. Se um dia cada
plano tiver a sua, o componente já recebe a URL por prop.

Renderizada com `next/image` e `priority`: é conteúdo acima da dobra.

## Acessibilidade

- A fachada é um `<button>`, não uma `div` clicável — funciona no teclado
- `aria-label` diz o que o clique faz ("Assistir o vídeo de boas-vindas")
- A capa entra como imagem decorativa (`alt=""`), já que o rótulo do
  botão descreve a ação

## Fora de escopo

- Capa por plano ou por vídeo cadastrado no admin
- Trocar o player das aulas (`/aulas/...`) pela mesma fachada
- Progresso ou marcação de "assistido" no tutorial

## Critérios

- [x] Spec antes do código
- [x] Boas-vindas mostra a capa com play antes de qualquer clique
- [x] Nenhum iframe do Panda é montado antes do clique
- [x] Depois do clique o vídeo do plano correto toca no mesmo espaço (F058)
- [x] Fachada é botão, acessível por teclado, com rótulo
- [x] Layout 16:9 preservado no mobile e no desktop
- [ ] Preview / HML antes de produção
