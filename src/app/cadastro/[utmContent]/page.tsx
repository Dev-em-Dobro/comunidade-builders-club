import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AuthSplitLayout } from "@/components/auth-split-layout";
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

  /*
   * F086 — os três blocos viraram ramos exclusivos. Antes eram três `if`
   * independentes; na coluna estreita do `AuthSplitLayout` isso empilhava
   * dois títulos concorrentes, e a tela precisa de um `h1` só.
   */
  return (
    <AuthSplitLayout>
      {user ? (
        profile?.welcomeSeenAt ? (
          <div>
            <h1 className="page-title">Olá, {profile.displayName}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Você já tem conta.{" "}
              <Link
                href="/"
                className="font-semibold text-accent hover:underline"
              >
                Ir para a comunidade
              </Link>
            </p>
          </div>
        ) : (
          <div>
            <h1 className="page-title">Conta criada</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              <Link
                href="/spaces/boas-vindas"
                className="font-semibold text-accent hover:underline"
              >
                Acesse Boas-vindas
              </Link>{" "}
              para ver o resto do conteúdo.
            </p>
          </div>
        )
      ) : (
        /*
         * A antiga descrição da página virou `subhead`: na coluna estreita,
         * dois blocos de texto antes do primeiro campo empurram o formulário
         * para fora da tela. Mesma decisão do `/cadastro`.
         */
        <GiftSignupForm
          variant="plain"
          headline="Crie sua conta grátis"
          subhead="Acesso free à comunidade. O conteúdo do presente continua no link que você já recebeu. O código de 6 dígitos chega no e-mail."
          alreadyMemberHref="/login"
        />
      )}
    </AuthSplitLayout>
  );
}
