# F121 — Pop-up Black Infinita no Presente (anônimo)

## Status
Em implementação — 2026-10-28

Depende de: [F119](F119-faixa-black-infinita-presente.md) (faixa no Presente),
[F117](F117-banner-black-infinita.md) (copy e destino),
[F078](F078-popup-aula-presente.md) / [F118](F118-popup-presente-sheet-pos-cadastro.md)
(pop-up da aula). **Não** é a [F120](F120-black-infinita-vitalicio.md) (vitalício
no Club).

## Contexto

Quem chega deslogado no Presente já vê a faixa da Black (F119) e a pop-up
da aula (F118). Esta feature acrescenta um convite curto em modal, **depois**
da aula, para a live da Black Infinita. Logado não vê: Free/Pro/Elite já
têm a F117 no Club.

## Decisões

### 1. Só visitante deslogado, só no Presente público

`getOptionalUser()`, igual à F119. Com user, o componente **não monta**.
Só `/presentes/[slug]` e `/presentes/[slug]/[utmContent]`.

### 2. Copy e destino já existentes

Texto da F119 / destino da F117 (`naoAluno`): sem UTM, sem copy nova.

- título e corpo: `BLACK_INFINITA_FAIXA_COPY` (a mesma frase da faixa)
- CTA: `BLACK_INFINITA.naoAluno.cta` → `https://blackinfinita.devemdobro.com/`
  em nova aba (`rel="noopener noreferrer"`)

### 3. Dispensa em `localStorage`, chave própria

`bc_black_infinita_popup_dismissed` (não é a chave da faixa). X (≥ 44×44,
`aria-label`) e o clique no CTA gravam `"1"`. Depois disso não volta neste
navegador. Sem flash: só pinta depois de ler o storage. Storage bloqueado:
aparece; fechar vale para a visita.

### 4. Nunca junto com a pop-up da aula

A pop-up da aula (F118) **não muda**. A Black só entra quando a da aula
já fechou nesta visita, ou se o delay dela passou sem `#popup-aula-titulo`
aparecer. Sem os dois `role="dialog"` ao mesmo tempo. Não espera cookies.
`cookie-consent.tsx` intocado.

### 5. Visual

Modal centrada, fade de opacity (`popup-aula-fade`). Sem slide. `z-[55]`:
acima do aviso (`z-50`), abaixo da aula (`z-[60]`) se os dois existirem
por engano.

## O que muda

| Arquivo | Mudança |
|---|---|
| `src/lib/presentes/black-infinita-popup.ts` | copy, chave, visibilidade, ordem |
| `src/app/presentes/presente-black-infinita-popup.tsx` | modal + X + CTA |
| `src/app/presentes/presente-publico.tsx` | monta só se `!user` |

Sem migration. Sem env. Sem mudança em F118 nem F057.

## Fora de escopo

- Faixa (F119) e banner logado (F117)
- Esperar Aceitar/Recusar cookies
- Persistir no banco
- UTM no destino
- Mudar a pop-up da aula

## Critérios de aceitação

- [x] Spec antes do código
- [ ] Deslogado vê a modal depois de fechar a da aula
- [ ] Logado não vê
- [ ] X e CTA gravam `bc_black_infinita_popup_dismissed`; reload não reabre
- [ ] Nunca junto com a pop-up da aula
- [ ] `cookie-consent.tsx` e `presente-aula-popup.tsx` intocados
- [ ] Testes da visibilidade e da ordem (sem Prisma)
- [ ] Sem migration
