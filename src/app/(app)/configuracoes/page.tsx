import Link from "next/link";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import {
  isEliteMembership,
  isPaidMembership,
} from "@/lib/membership/capabilities";
import { PlanBadge } from "@/components/plan-badge";
import { ExcluirConta } from "@/components/excluir-conta";
import { ThemeToggle } from "@/components/theme-toggle";
import { EMAIL_SUPORTE, emailSuporteUrl, whatsappSuporteUrl } from "@/lib/suporte";

export const metadata = { title: "Configurações" };

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.26.86 5.81 2.42a8.17 8.17 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.09-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.22.25-.85.84-.85 2.03s.87 2.35 1 2.51c.12.17 1.72 2.62 4.16 3.67.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  );
}

function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-base font-semibold text-foreground">{titulo}</h2>
      {descricao ? <p className="mt-1 text-sm text-muted">{descricao}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <dt className="shrink-0 text-muted">{rotulo}</dt>
      <dd className="min-w-0 truncate font-medium text-foreground">{valor}</dd>
    </div>
  );
}

export default async function ConfiguracoesPage() {
  const member = await requireActiveMemberOrRedirect();
  const { user, profile, membership } = member;
  const isPaid = isPaidMembership(membership);
  const isElite = isEliteMembership(membership);
  const whatsapp = whatsappSuporteUrl();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="page-title">Configurações</h1>
      <p className="mt-1 text-sm text-muted">
        Sua conta, seu plano e as preferências do app.
      </p>

      <Secao titulo="Conta">
        <dl className="flex flex-col gap-3">
          <Linha rotulo="E-mail" valor={user.email} />
          <Linha rotulo="Nome" valor={profile.displayName} />
          <Linha
            rotulo="Membro desde"
            valor={profile.joinedAt.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />
        </dl>
        <Link href="/perfil" className="btn-outline mt-4">
          Editar perfil
        </Link>
      </Secao>

      <Secao titulo="Plano e pagamento">
        <div className="flex flex-wrap items-center gap-3">
          <PlanBadge isPaid={isPaid} isElite={isElite} size="md" />
          {!isElite ? (
            <Link href="/planos" className="btn-primary">
              {isPaid ? "Fazer upgrade" : "Ver planos"}
            </Link>
          ) : null}
        </div>

        <div className="mt-5 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-medium text-foreground">
            Precisa de ajuda com a assinatura?
          </p>
          <p className="mt-1 text-sm text-muted">
            O pagamento é processado pela Hubla. Para trocar a forma de
            pagamento, atualizar dados de cobrança ou cancelar, fale com a
            gente — a gente resolve com você.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Enquanto não houver WhatsApp, o e-mail é o canal principal. */}
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline gap-2"
              >
                <WhatsAppIcon />
                Falar no WhatsApp
              </a>
            ) : null}
            <a href={emailSuporteUrl()} className="btn-outline gap-2">
              <MailIcon />
              Enviar e-mail
            </a>
            <span className="text-sm text-muted">{EMAIL_SUPORTE}</span>
          </div>
        </div>
      </Secao>

      <Secao titulo="Aparência" descricao="Vale só neste navegador.">
        <ThemeToggle />
      </Secao>

      <ExcluirConta />
    </div>
  );
}
