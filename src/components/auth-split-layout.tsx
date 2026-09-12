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
    "radial-gradient(ellipse 85% 55% at 12% 0%, rgba(45,212,191,0.30), transparent 62%)",
    "radial-gradient(ellipse 60% 45% at 72% 42%, rgba(20,184,166,0.15), transparent 62%)",
    "radial-gradient(ellipse 75% 50% at 95% 100%, rgba(13,148,136,0.34), transparent 58%)",
    "linear-gradient(158deg, #052e2c 0%, #06231f 48%, #03191a 100%)",
  ].join(","),
} as const;

/** Malha fina por cima do gradiente — eco da identidade do boas-vindas. */
const PAINEL_MALHA = {
  backgroundImage: [
    "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px)",
    "linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
  ].join(","),
  backgroundSize: "34px 34px",
  maskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, black, transparent)",
  WebkitMaskImage:
    "radial-gradient(ellipse 70% 70% at 50% 40%, black, transparent)",
} as const;

const PROVAS = [
  "As primeiras aulas da formação, de graça",
  "Feed com o que a comunidade está fechando",
  "Skills prontas e presentes pra usar hoje",
];

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
          style={PAINEL_MALHA}
          aria-hidden
        />

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
