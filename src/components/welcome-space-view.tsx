import Link from "next/link";

const STEPS = [
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
  },
] as const;

export function WelcomeSpaceView({
  spaceName,
  spaceDescription,
  tutorialEmbedUrl,
  tutorialTitle,
}: {
  spaceName: string;
  spaceDescription: string | null;
  tutorialEmbedUrl?: string | null;
  tutorialTitle?: string;
}) {
  return (
    <div className="feed-wrap-wide">
      <div>
        <h1 className="page-title">{spaceName}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          {spaceDescription?.trim() ||
            "Assista o tutorial e siga os três passos. Um caminho só — o suficiente para o primeiro dia."}
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
            Oito minutos. Menu, Spaces, aulas — e onde postar sua primeira conquista.
          </p>
        </div>
      ) : null}

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
        {tutorialEmbedUrl ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-sm lg:col-span-2">
            <div className="relative aspect-video w-full">
              <iframe
                src={tutorialEmbedUrl}
                title={tutorialTitle ?? "Tutorial da comunidade"}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                referrerPolicy="origin"
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted lg:col-span-2">
            Tutorial em breve. Enquanto isso, siga os três passos ao lado.
          </p>
        )}

        <section className="post-card p-5 lg:col-span-1">
          <h2 className="font-[family-name:var(--font-outfit)] text-base font-semibold tracking-tight">
            Primeiros passos
          </h2>
          <ol className="mt-4 space-y-4">
            {STEPS.map((step) => (
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
                    {step.n === "3" ? (
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
