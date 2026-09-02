import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { NOME_PRODUTO } from "@/lib/produto";
import { ThemeToggle } from "@/components/theme-toggle";
import { GiftSignupForm } from "@/components/gift-signup-form";
import { MarkdownBody } from "@/lib/markdown";
import { PostMedia } from "@/components/post-media";
import { OptimizedMediaImage } from "@/components/optimized-media-image";
import { previewFromBody } from "@/lib/posts/title";
import { getOptionalUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { isPaidMembership } from "@/lib/membership/capabilities";
import { getPublicGift, recordGiftVisit } from "@/lib/gifts";
import { giftLinkView } from "@/lib/gifts/link";
import { GIFT_UTM_DEFAULTS, sanitizeUtmValue } from "@/lib/gifts/origem";
import { PresentePromessa } from "@/app/presentes/presente-promessa";

/** Âncora do CTA "Criar conta grátis" do bloco de promessa (F063). */
const FORM_ANCHOR_ID = "criar-conta";

export type GiftUtm = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
};

export function utmFromSearch(
  sp: Record<string, string | string[] | undefined>,
): GiftUtm {
  return {
    source: pick(sp, "utm_source"),
    medium: pick(sp, "utm_medium"),
    campaign: pick(sp, "utm_campaign"),
    content: pick(sp, "utm_content"),
  };
}

export function utmFromPathContent(utmContent: string): GiftUtm {
  return {
    source: GIFT_UTM_DEFAULTS.source,
    medium: GIFT_UTM_DEFAULTS.medium,
    campaign: GIFT_UTM_DEFAULTS.campaign,
    content: sanitizeUtmValue(utmContent),
  };
}

function pick(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const v = sp[key];
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

export async function PresentePublico({
  slug,
  utm,
}: {
  slug: string;
  utm: GiftUtm;
}) {
  const gift = await getPublicGift(slug);
  if (!gift) notFound();

  const h = await headers();
  await recordGiftVisit({
    giftSlug: gift.slug ?? slug,
    userAgent: h.get("user-agent"),
    referrer: h.get("referer"),
    utmSource: utm.source,
    utmMedium: utm.medium,
    utmCampaign: utm.campaign,
    utmContent: utm.content,
  });

  const user = await getOptionalUser();
  const profile = user
    ? await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { welcomeSeenAt: true, displayName: true },
      })
    : null;
  /**
   * F063 — o bloco da promessa tem três variantes por sessão. Quem já é
   * pago não vê oferta nenhuma; para isso é preciso o tier, não só o user.
   */
  const membership = user
    ? await prisma.membership.findUnique({
        where: { userId: user.id },
        select: { tier: true, role: true, status: true },
      })
    : null;
  const isPaid = membership ? isPaidMembership(membership) : false;

  const link = giftLinkView({
    title: gift.title,
    body: gift.body,
    linkUrl: gift.linkUrl,
  });
  /**
   * F059 — antes, presente com link e sem título de composer caía em `null`, e
   * o <h1> virava `sr-only` porque o card "Abrir presente" já mostrava o
   * título na tela. Sem o card, isso deixaria a página sem título visível.
   */
  const title = link
    ? link.title
    : gift.title?.trim() || previewFromBody(gift.body, 90) || "Presente";
  const authorName = gift.author.profile?.displayName ?? "Builders Club";
  /**
   * F060 — presente sem link é texto para ler: mostra o corpo.
   * Antes só existia o caso "presente é um link", e `link?.showBody` deixava
   * a página com o título sozinho.
   */
  const showBody = link ? link.showBody : gift.body.trim().length > 0;

  return (
    <div className="relative min-h-dvh px-4 py-10">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle variant="icon" />
      </div>
      {/* F060 — presente é leitura pública: mesma coluna e escala do post. */}
      <main className="reading-wrap">
        <p className="font-[family-name:var(--font-outfit)] text-sm font-semibold uppercase tracking-[0.12em] text-accent">
          {NOME_PRODUTO}
        </p>
        <p className="mt-1 text-xs text-muted">{gift.space.name}</p>

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
            <Link href="/spaces/presentes" className="text-accent hover:underline">
              Ver todos os presentes
            </Link>
          </div>
        ) : null}

        <article className="mt-8">
          {/*
           * F076 — a capa abre o artigo. Antes, `imageUrl` só saía no PostMedia
           * lá embaixo, depois do texto: o que era para ser capa chegava como
           * rodapé, e a página abria sempre com um bloco de texto puro.
           */}
          {gift.imageUrl ? (
            <div className="mb-6 overflow-hidden rounded-2xl bg-surface/60">
              <OptimizedMediaImage
                src={gift.imageUrl}
                alt=""
                variant="detail"
                priority
                className="max-h-[22rem] w-full object-cover"
              />
            </div>
          ) : null}
          <h1 className="reading-title">{title}</h1>
          <p className="mt-4 text-sm text-muted">
            {authorName} ·{" "}
            {gift.createdAt.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="mt-5 border-t border-border/70" />
          {showBody ? (
            <div className="mt-8">
              <MarkdownBody body={gift.body} variant="reading" />
            </div>
          ) : null}
          {/*
           * F059 — o card "Abrir presente" saiu: ele repetia o <h1> da página
           * logo abaixo do corpo. O link volta a sair pelo PostMedia, que o
           * card suprimia — sem isso, presentes cujo `linkUrl` não aparece no
           * corpo (whisper-local, hermes, os de teste) ficariam sem link.
           */}
          {/* F076 — sem `imageUrl` aqui: ela virou a capa acima do título. */}
          <PostMedia videoUrl={gift.videoUrl} linkUrl={gift.linkUrl} />
        </article>

        {/*
         * F063 — a promessa fecha a leitura e abre a oferta. Depois do
         * <article>, antes do formulário; some para quem já é pago.
         */}
        {!isPaid ? (
          <PresentePromessa
            variante={user ? "free" : "anonima"}
            formAnchorId={FORM_ANCHOR_ID}
          />
        ) : null}

        {!user ? (
          <div id={FORM_ANCHOR_ID} className="mx-auto mt-8 w-full max-w-xl">
            <GiftSignupForm />
          </div>
        ) : null}
      </main>
    </div>
  );
}
