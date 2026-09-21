import Link from "next/link";
import { requirePaidMemberOrRedirect } from "@/lib/membership/require-member";
import {
  hrefPlanos,
  isEliteMembership,
} from "@/lib/membership/capabilities";
import { ENTREGAVEIS } from "@/lib/entregaveis";
import { entregavelExigeElite } from "@/lib/entregaveis/catalogo";

function IconeDownload() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-3.5 w-3.5 shrink-0"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function SeloElite() {
  return (
    <span className="inline-flex items-center rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
      Elite
    </span>
  );
}

export default async function EntregaveisPage() {
  const member = await requirePaidMemberOrRedirect(
    hrefPlanos({ motivo: "materiais" }),
  );
  const isElite = isEliteMembership(member.membership);
  const disponiveis = ENTREGAVEIS.filter((e) => !e.emBreve);
  const emBreve = ENTREGAVEIS.filter((e) => e.emBreve);
  const upgradeElite = hrefPlanos({
    motivo: "materiais-elite",
    destaque: "elite",
  });

  return (
    <div className="feed-wrap">
      <h1 className="page-title">Materiais</h1>
      <p className="mt-1.5 text-sm text-muted">
        Tudo o que você recebe na Consultoria Freela, num lugar só.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold text-foreground/80">
          Disponível agora
        </h2>
        <ul className="space-y-3">
          {disponiveis.map((item) => {
            const lockedElite = entregavelExigeElite(item) && !isElite;
            return (
              <li key={item.slug} className="post-card space-y-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{item.titulo}</p>
                    {entregavelExigeElite(item) ? <SeloElite /> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted">{item.descricao}</p>
                </div>
                {lockedElite ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-muted">
                      Incluso no plano Elite.
                    </p>
                    <Link
                      href={upgradeElite}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      Ver Elite →
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/entregaveis/${item.slug}`}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      Abrir →
                    </Link>
                    {item.kitZip ? (
                      <a
                        href={`/api/entregaveis/download/${item.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/50 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                        download={item.kitZip.nomeArquivo}
                      >
                        <IconeDownload />
                        Baixar .zip
                      </a>
                    ) : null}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {emBreve.length > 0 ? (
        <section className="mt-10 space-y-3">
          <h2 className="text-sm font-semibold text-muted">Em breve</h2>
          <ul className="space-y-3">
            {emBreve.map((item) => (
              <li
                key={item.slug}
                className="post-card border-dashed opacity-70"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-muted">{item.titulo}</p>
                  {entregavelExigeElite(item) ? <SeloElite /> : null}
                </div>
                <p className="mt-1 text-sm text-muted">{item.descricao}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
