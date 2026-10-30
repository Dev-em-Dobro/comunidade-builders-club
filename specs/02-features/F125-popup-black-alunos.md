# F125 — Pop-up Black para alunos no Club (logado)

## Status
Em implementação — 2026-10-30

Depende de: [F120](F120-black-infinita-vitalicio.md) (quem comprou a Black
vira Vitalício). **Não** mexe na [F117](F117-banner-black-infinita.md)
(faixa do topo) nem na [F121](F121-popup-black-infinita-presente.md)
(pop-up do Presente para anônimos).

## Contexto

A oferta de alunos da Black Infinita abriu em 30/10. O mesmo pop-up entra
nas ferramentas da Dev em Dobro (CodeQuest, Scudo, Agents, Orion) e leva o
aluno para a página de vendas dele. No Club ele aparece para quem está
logado na área do app.

## Decisões

### 1. Mesmo script das ferramentas

`public/black-popup.js` + `public/gemeos.webp`, iguais aos das outras
ferramentas. Shadow DOM, sem React, sem lib nova. Montado com
`next/script` (`afterInteractive`) no layout `(app)`.

### 2. Só aluno pago que ainda não comprou

Vê quem é `isPaid` (paid, PRO, Elite, admin, instructor) e **não** é
Vitalício. Free não é aluno: a oferta não é para ele. Vitalício já comprou
a Black (F120): oferecer de novo não faz sentido.

### 3. Nunca junto com modal obrigatória

Termos Elite e contrato de conteúdos já trocam o layout inteiro (o
pop-up nem monta). Com a modal de ciência da garantia aberta, também não
monta: o pop-up fica acima de tudo e taparia a modal.

### 4. Copy e destino

- título: Black para alunos: DevQuest 2.0 + Builders Club
- texto: Aprenda a criar projetos com IA, prospectar clientes e tenha 1
  ano de acompanhamento. R$ 797 à vista ou 12x de R$ 80,98. Condição
  exclusiva desta turma. Depois, o preço volta ao normal.
- CTA: **Quero aproveitar** → `https://blackinfinita.devemdobro.com/alunos-dq`
  em nova aba

### 5. Dispensa

X, "Agora não", Esc, clique fora e o CTA gravam `dd-black-alunos-fechado`
(localStorage + cookie). Não volta neste navegador. Sem data de fim: sai
com outro deploy.

## O que muda

| Arquivo | Mudança |
|---|---|
| `public/black-popup.js` | script do pop-up |
| `public/gemeos.webp` | foto do topo |
| `src/lib/eventos/black-alunos-popup.ts` | quem vê |
| `src/app/(app)/layout.tsx` | monta o script se a regra deixar |

Sem migration. Sem env.

## Fora de escopo

- Atualizar a faixa da F117 (aluno ainda vai para o grupo de 28/10)
- Data de fim automática
- Persistir dispensa no banco

## Critérios de aceitação

- [x] Spec antes do código
- [ ] Pago não Vitalício vê o pop-up e o CTA abre `/alunos-dq`
- [ ] Free não vê
- [ ] Vitalício não vê
- [ ] Com a modal de garantia aberta, não vê
- [ ] Fechar grava a dispensa; reload não reabre
- [ ] Testes da regra de visibilidade
- [ ] Sem migration
