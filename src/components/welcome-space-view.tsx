import Link from "next/link";
import { WelcomeTutorialPlayer } from "@/components/welcome-tutorial-player";
import { WelcomeUpgradeBanner } from "@/components/welcome-upgrade-banner";
import { METODO_HREF } from "@/lib/metodo/copy";

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
    href: METODO_HREF,
    label: "Ler o Método: Comece por aqui",
    hint: "O manifesto e o passo a passo do caminho até o primeiro cliente.",
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
 * F106 — depois do vídeo, o próximo passo explícito é o Método.
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
    href: METODO_HREF,
    label: "Ler o Método: Comece por aqui",
    hint: "O manifesto e o passo a passo — assista as aulas do método a partir daí.",
  },
  {
    n: "3",
    href: "/spaces/conquistas",
    label: "Ver a comunidade fechando clientes",
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
  tutorialEmbedUrl,
  tutorialVideoId,
  tutorialTitle,
  isPaid,
}: {
  /** Mantido na API da página; o título da tela é fixo (F106). */
  spaceName?: string;
  spaceDescription?: string | null;
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
        <h1 className="page-title">Como usar a comunidade</h1>
        {/* F106 — copy revisada: assista antes de começar, depois Método. */}
        <div className="mt-3 max-w-2xl space-y-3 text-[15px] leading-relaxed text-muted md:text-base">
          <p>Olá.</p>
          <p>
            Temos um vídeo curto de como a comunidade funciona: onde postar,
            como achar as aulas e os materiais.
          </p>
          <p>É direto. Assista antes de começar.</p>
          <p>
            Depois disso, vá em{" "}
            <Link
              href={METODO_HREF}
              className="font-medium text-foreground underline-offset-2 hover:text-accent hover:underline"
            >
              Método: Comece por aqui
            </Link>{" "}
            e siga o passo a passo.
          </p>
          <p>Boa jornada.</p>
        </div>
      </div>

      {tutorialEmbedUrl ? (
        <div className="mt-6">
          <h2
            id="welcome-tutorial-title"
            className="font-[family-name:var(--font-outfit)] text-base font-semibold tracking-tight"
          >
            {tutorialTitle ?? "Como usar a comunidade"}
          </h2>
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

      {/* F069 — a oferta fecha a página, fora da trilha. Só para o free. */}
      {isPaid ? null : <WelcomeUpgradeBanner />}
    </div>
  );
}
