"use client";

import Link from "next/link";
import { AULAS_FREE_HREF } from "@/lib/aulas/access";
import {
  MANIFESTO_PARAGRAFOS,
  MANIFESTO_TITULO,
} from "@/lib/metodo/copy";
import { useUpgrade } from "@/components/upgrade-modal";

type Step = {
  n: string;
  label: string;
  hint: string;
  href?: string;
  /** WhatsApp Elite — cadeado se não Elite. */
  whatsappElite?: boolean;
};

const STEPS_BASE: Step[] = [
  {
    n: "1",
    href: "/perfil",
    label: "Completar o perfil",
    hint: "Nome e foto — é assim que a comunidade te encontra.",
  },
  {
    n: "2",
    href: AULAS_FREE_HREF,
    label: "Assistir as aulas do método",
    hint: "Fase 1 e Fase 2: prospecção, projetos e as ferramentas prontas. É a base — live não substitui isso.",
  },
  {
    n: "3",
    href: "/spaces/conquistas",
    label: "Praticar e postar na comunidade",
    hint: "Dúvida, projeto ou vitória — mostre o que está fazendo e peça ajuda quando travar.",
  },
];

const STEP_WHATSAPP: Step = {
  n: "4",
  label: "Entrar no grupo de WhatsApp",
  hint: "Canal do Elite pra tirar dúvida e acompanhar a execução.",
  whatsappElite: true,
};

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0 opacity-70"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/** Mesmo corpo de leitura dos posts abertos (MarkdownBody variant=reading). */
const CORPO_LEITURA =
  "space-y-5 text-[1.0625rem] leading-[1.7] text-foreground/90 md:text-[1.1875rem]";

export function MetodoView({
  isElite,
  whatsappUrl,
}: {
  isElite: boolean;
  whatsappUrl: string | null;
}) {
  const { openUpgrade } = useUpgrade();
  const steps = [
    ...STEPS_BASE,
    { ...STEP_WHATSAPP, n: String(STEPS_BASE.length + 1) },
  ];

  return (
    <div className="reading-wrap">
      {/*
        F106 — um card no estilo de post aberto: título grande + corpo reading.
        Sem hover de feed (já está “aberto”).
      */}
      <article className="post-card !shadow-none hover:!shadow-none p-5 sm:p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent">
          Leia com atenção
        </p>
        <h1 className="reading-title mt-3">{MANIFESTO_TITULO}</h1>
        <div className={`mt-8 ${CORPO_LEITURA}`}>
          {MANIFESTO_PARAGRAFOS.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </div>
      </article>

      <section className="post-card mt-6 !shadow-none hover:!shadow-none p-5 sm:p-8">
        <h2 className="font-[family-name:var(--font-outfit)] text-xl font-bold tracking-tight md:text-2xl">
          Passo a passo
        </h2>
        <ol className="mt-6 space-y-5">
          {steps.map((step) => (
            <li key={step.n} className="flex gap-3">
              <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent"
                aria-hidden
              >
                {step.n}
              </span>
              <div className="min-w-0">
                {step.whatsappElite ? (
                  isElite && whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[1.0625rem] font-semibold text-foreground underline-offset-2 hover:text-accent hover:underline md:text-[1.125rem]"
                    >
                      {step.label}
                    </a>
                  ) : isElite ? (
                    <span className="text-[1.0625rem] font-semibold text-foreground md:text-[1.125rem]">
                      {step.label}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openUpgrade("whatsapp-elite")}
                      className="inline-flex items-center gap-2 text-[1.0625rem] font-semibold text-foreground underline-offset-2 hover:text-accent hover:underline md:text-[1.125rem]"
                    >
                      {step.label}
                      <LockIcon />
                    </button>
                  )
                ) : (
                  <Link
                    href={step.href!}
                    className="text-[1.0625rem] font-semibold text-foreground underline-offset-2 hover:text-accent hover:underline md:text-[1.125rem]"
                  >
                    {step.label}
                  </Link>
                )}
                <p className="mt-1 text-[15px] leading-snug text-muted md:text-base">
                  {step.whatsappElite && isElite && !whatsappUrl
                    ? "Peça o link do grupo no plantão ou no suporte Elite."
                    : step.hint}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
