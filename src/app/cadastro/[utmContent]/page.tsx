import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { NOME_PRODUTO } from "@/lib/produto";
import { ThemeToggle } from "@/components/theme-toggle";
import { GiftSignupForm } from "@/components/gift-signup-form";
import { getOptionalUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { recordGiftVisit } from "@/lib/gifts";
import {
  CADASTRO_LANDING_SLUG,
  GIFT_UTM_DEFAULTS,
  sanitizeUtmValue,
} from "@/lib/gifts/origem";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ utmContent: string }>;
};

export default async function CadastroOrigemPage({ params }: Props) {
  const { utmContent: raw } = await params;
  const utmContent = sanitizeUtmValue(raw);
  if (!utmContent) notFound();

  const h = await headers();
  await recordGiftVisit({
    giftSlug: CADASTRO_LANDING_SLUG,
    userAgent: h.get("user-agent"),
    referrer: h.get("referer"),
    utmSource: GIFT_UTM_DEFAULTS.source,
    utmMedium: GIFT_UTM_DEFAULTS.medium,
    utmCampaign: GIFT_UTM_DEFAULTS.campaign,
    utmContent,
  });

  const user = await getOptionalUser();
  const profile = user
    ? await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { welcomeSeenAt: true, displayName: true },
      })
    : null;

  return (
    <div className="relative min-h-dvh px-4 py-10">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle variant="icon" />
      </div>
      <main className="mx-auto w-full max-w-xl">
        <p className="font-[family-name:var(--font-outfit)] text-sm font-semibold uppercase tracking-[0.12em] text-accent">
          {NOME_PRODUTO}
        </p>
        <h1 className="page-title mt-3">Crie sua conta grátis</h1>
        <p className="mt-2 text-sm text-muted">
          Acesso free à comunidade. O conteúdo do presente continua no link
          que você já recebeu.
        </p>

        {user && !profile?.welcomeSeenAt ? (
          <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">
            Conta criada.{" "}
            <Link
              href="/spaces/boas-vindas"
              className="font-semibold text-accent hover:underline"
            >
              Acesse Boas-vindas
            </Link>{" "}
            para ver o resto do conteúdo.
          </div>
        ) : null}

        {user && profile?.welcomeSeenAt ? (
          <div className="mt-6 rounded-2xl border border-border/80 bg-card px-4 py-3 text-sm text-muted">
            Olá, {profile.displayName}.{" "}
            <Link href="/" className="text-accent hover:underline">
              Ir para a comunidade
            </Link>
          </div>
        ) : null}

        {!user ? (
          <div className="mt-8">
            <GiftSignupForm
              headline="Criar conta no Builders Club"
              subhead="Conta gratuita. Código no e-mail, você cola nesta mesma tela."
              alreadyMemberHref="/login"
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
