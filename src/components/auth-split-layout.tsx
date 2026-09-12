import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * F086 — shell das telas de entrada (`/login` e `/cadastro`).
 *
 * Desktop: 50/50, painel de marca sangrando de topo a base.
 * Mobile: o painel vira faixa curta no topo e o formulário vem logo abaixo —
 * no celular a marca não pode empurrar o campo de e-mail para fora da dobra.
 */

/**
 * O painel é escuro nos DOIS temas: é dele que vem o contraste com a coluna
 * do formulário, que é quem segue claro/escuro. Por isso as cores são
 * literais e não os tokens `--bc-*`.
 */
const PAINEL_FUNDO = {
  backgroundImage: [
    "radial-gradient(ellipse 80% 50% at 14% 0%, rgba(45,212,191,0.24), transparent 62%)",
    "radial-gradient(ellipse 70% 45% at 92% 100%, rgba(13,148,136,0.28), transparent 58%)",
    "linear-gradient(162deg, #052e2c 0%, #051f22 55%, #02161a 100%)",
  ].join(","),
} as const;

/**
 * Grade isométrica: o chão onde os blocos assentam.
 *
 * Em CSS e não no SVG de propósito — o `repeating-linear-gradient` ladrilha
 * em qualquer proporção, então a mesma textura serve a coluna de 720x900 do
 * desktop e a faixa de 375x155 do mobile. Um SVG com `viewBox` fixo daria
 * zoom absurdo na faixa.
 *
 * O ângulo do gradiente é perpendicular às listras: 120deg desenha linhas a
 * +30° e 60deg desenha a -30°, que é o par isométrico.
 */
const PAINEL_GRADE = {
  backgroundImage: [
    "repeating-linear-gradient(120deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 56px)",
    "repeating-linear-gradient(60deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 56px)",
  ].join(","),
  maskImage: "radial-gradient(ellipse 75% 75% at 50% 42%, black, transparent)",
  WebkitMaskImage:
    "radial-gradient(ellipse 75% 75% at 50% 42%, black, transparent)",
} as const;

/** Brilho por trás da pilha, para os blocos não flutuarem no vazio. */
const BLOCOS_BRILHO = {
  backgroundImage:
    "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(45,212,191,0.22), transparent 70%)",
  filter: "blur(46px)",
} as const;

const PROVAS = [
  "As primeiras aulas da formação, de graça",
  "Feed com o que a comunidade está fechando",
  "Skills prontas e presentes pra usar hoje",
];

/**
 * Três blocos empilhados, do mais largo ao mais estreito: a operação que a
 * pessoa monta camada por camada. Cada bloco são três faces — topo iluminado,
 * lateral esquerda neutra, lateral direita na sombra.
 *
 * Só a partir de `lg`: na faixa mobile a pilha ficaria do tamanho de um
 * ícone, e aí a grade isométrica sozinha carrega a textura.
 */
function BlocosIsometricos() {
  return (
    <svg
      viewBox="100 110 240 385"
      fill="none"
      className="pointer-events-none absolute left-1/2 top-[36%] -z-10 hidden w-[13rem] -translate-x-1/2 -translate-y-1/2 lg:block xl:w-[15rem]"
      aria-hidden
    >
      <g stroke="rgba(94,234,212,0.32)" strokeWidth="1.4">
        {/* base */}
        <path d="M220 430l108-62-108-62-108 62z" fill="rgba(45,212,191,0.13)" />
        <path d="M112 368v54l108 62v-54z" fill="rgba(255,255,255,0.04)" />
        <path d="M328 368v54l-108 62v-54z" fill="rgba(0,0,0,0.28)" />
        {/* meio */}
        <path d="M220 300l84-48-84-49-84 49z" fill="rgba(45,212,191,0.17)" />
        <path d="M136 252v50l84 49v-50z" fill="rgba(255,255,255,0.05)" />
        <path d="M304 252v50l-84 49v-50z" fill="rgba(0,0,0,0.28)" />
        {/* topo */}
        <path d="M220 188l58-34-58-33-58 33z" fill="rgba(94,234,212,0.24)" />
        <path d="M162 154v40l58 33v-40z" fill="rgba(255,255,255,0.06)" />
        <path d="M278 154v40l-58 33v-40z" fill="rgba(0,0,0,0.28)" />
      </g>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-4 w-4 shrink-0 text-teal-400"
      aria-hidden
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function AuthSplitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] lg:grid-cols-2 lg:grid-rows-1">
      <aside
        className="relative isolate flex flex-col justify-center gap-3 overflow-hidden px-6 py-8 lg:justify-between lg:gap-10 lg:px-12 lg:py-14 xl:px-16"
        style={PAINEL_FUNDO}
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={PAINEL_GRADE}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[36%] -z-10 hidden h-80 w-80 -translate-x-1/2 -translate-y-1/2 lg:block"
          style={BLOCOS_BRILHO}
          aria-hidden
        />
        <BlocosIsometricos />

        <div>
          <p className="font-[family-name:var(--font-outfit)] text-xl font-bold uppercase tracking-[0.16em] text-white lg:text-2xl">
            Builders <span className="text-teal-400">Club</span>
          </p>
          <span
            className="mt-2 block h-0.5 w-12 rounded-full bg-teal-400"
            aria-hidden
          />
        </div>

        <div>
          {/* F067 — o posicionamento do Club antes de a tela pedir o e-mail. */}
          <p className="max-w-md text-sm leading-relaxed text-white/75 lg:font-[family-name:var(--font-outfit)] lg:text-[1.6rem] lg:font-semibold lg:leading-snug lg:text-white">
            A comunidade de quem está montando a própria operação de IA e
            automação.
          </p>

          <ul className="mt-8 hidden max-w-md flex-col gap-3 lg:flex">
            {PROVAS.map((prova) => (
              <li
                key={prova}
                className="flex items-start gap-2.5 text-[15px] leading-relaxed text-white/70"
              >
                <CheckIcon />
                {prova}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/*
       * `items-start` + `pt-16` no mobile: centrado, o formulário descolava da
       * faixa e o campo de e-mail caía perto da dobra. O `pt` também reserva a
       * linha do `ThemeToggle`, que senão encosta no `h1`.
       */}
      <div className="relative flex items-start justify-center px-6 pb-12 pt-16 lg:items-center lg:px-12 lg:py-12">
        <div className="absolute right-4 top-4 z-10">
          <ThemeToggle variant="icon" />
        </div>
        <main className="w-full max-w-sm animate-[fadeIn_0.4s_ease-out]">
          {children}
        </main>
      </div>
    </div>
  );
}
