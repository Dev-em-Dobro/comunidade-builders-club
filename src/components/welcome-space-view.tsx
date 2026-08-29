import Link from "next/link";
import { WelcomeTutorialPlayer } from "@/components/welcome-tutorial-player";

type Step = {
  n: string;
  href: string;
  label: string;
  hint: string;
  /** Passo 3 do pago tem links embutidos no texto. */
  richHint?: boolean;
};

const STEPS_PAGO: Step[] = [
  {
    n: "1",
    href: "/perfil",
    label: "Completar o perfil",
    hint: "Nome e foto — é assim que a comunidade te encontra.",
  },
  {
    n: "2",
    href: "/aulas",
    label: "Assistir as aulas",
    hint: "Comece pelo tutorial. A primeira aula é este vídeo, com o passo a passo da plataforma.",
  },
  {
    n: "3",
    href: "/spaces/conquistas",
    label: "Postar na comunidade quando tiver dúvida ou conquista",
    hint: "",
    richHint: true,
  },
];

/**
 * F063 / F065 — a trilha do free só pode ter o que ele consegue fazer.
 * Publicar fora de projetos continua PRO+. O Comece por aqui (F065) entra
 * como passo 2.
 */
const STEPS_FREE: Step[] = [
  {
    n: "1",
    href: "/perfil",
    label: "Completar o perfil",
    hint: "Nome e foto — é assim que a comunidade te encontra.",
  },
  {
    n: "2",
    href: "/aulas",
    label: "Assistir as primeiras aulas",
    // F067 — a trilha é onboarding, não pitch: sai a menção ao plano pago,
    // que fechava o passo na tranca em vez do próximo movimento dela.
    hint: "O Comece por aqui está liberado. Assista e conheça o método — é a base de tudo o que vem depois.",
  },
  {
    n: "3",
    href: "/spaces/conquistas",
    label: "Ver o que a comunidade está fechando",
    hint: "Cliente fechado, proposta aceita, primeiro pagamento — com quanto cobraram e como entregaram.",
  },
  {
    n: "4",
    href: "/spaces/presentes",
    label: "Pegar os outros presentes",
    hint: "Os kits liberados ficam todos aqui, abertos para você.",
  },
];

export function WelcomeSpaceView({
  spaceName,
  spaceDescription,
  tutorialEmbedUrl,
  tutorialVideoId,
  tutorialTitle,
  isPaid,
}: {
  spaceName: string;
  spaceDescription: string | null;
  tutorialEmbedUrl?: string | null;
  tutorialVideoId?: string;
  tutorialTitle?: string;
  /** F063 — a trilha do free não pode ter link bloqueado. */
  isPaid: boolean;
}) {
  const steps = isPaid ? STEPS_PAGO : STEPS_FREE;

  return (
    <div className="feed-wrap-wide">
      <div>
        <h1 className="page-title">{spaceName}</h1>
        {/* F067 — "passo a passo" cobre as duas trilhas (3 no pago, 4 no
            free) e não quebra quando a lista muda de tamanho. */}
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          {spaceDescription?.trim() ||
            "Assista o tutorial e siga o passo a passo. Um caminho só — o suficiente para o primeiro dia."}
        </p>
      </div>

      {tutorialEmbedUrl ? (
        <div className="mt-6">
          <h2
            id="welcome-tutorial-title"
            className="font-[family-name:var(--font-outfit)] text-base font-semibold tracking-tight"
          >
            {tutorialTitle ?? "Como usar a comunidade"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Quer saber quem são os builders? Assista o vídeo abaixo.
          </p>
        </div>
      ) : null}

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
        {tutorialEmbedUrl ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-sm lg:col-span-2">
            {/* F068 — capa com play; o iframe só monta no clique. */}
            <WelcomeTutorialPlayer
              embedUrl={tutorialEmbedUrl}
              videoId={tutorialVideoId}
              title={tutorialTitle ?? "Tutorial da comunidade"}
            />
          </div>
        ) : (
          <p className="text-sm text-muted lg:col-span-2">
            Tutorial em breve. Enquanto isso, siga os passos ao lado.
          </p>
        )}

        <section className="post-card p-5 lg:col-span-1">
          <h2 className="font-[family-name:var(--font-outfit)] text-base font-semibold tracking-tight">
            Primeiros passos
          </h2>
          <ol className="mt-4 space-y-4">
            {steps.map((step) => (
              <li key={step.n} className="flex gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent"
                  aria-hidden
                >
                  {step.n}
                </span>
                <div className="min-w-0">
                  <Link
                    href={step.href}
                    className="font-medium text-foreground underline-offset-2 hover:text-accent hover:underline"
                  >
                    {step.label}
                  </Link>
                  <p className="mt-0.5 text-sm leading-snug text-muted">
                    {step.richHint ? (
                      <>
                        Dúvida no space{" "}
                        <Link
                          href="/spaces/duvidas"
                          className="font-medium text-foreground underline-offset-2 hover:text-accent hover:underline"
                        >
                          Dúvidas
                        </Link>
                        . Projeto ou vitória em{" "}
                        <Link
                          href="/spaces/conquistas"
                          className="font-medium text-foreground underline-offset-2 hover:text-accent hover:underline"
                        >
                          Conquistas
                        </Link>{" "}
                        — a equipe avalia por lá.
                      </>
                    ) : (
                      step.hint
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
