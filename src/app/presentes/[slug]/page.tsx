import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { NOME_PRODUTO } from "@/lib/produto";
import { ThemeToggle } from "@/components/theme-toggle";
import { GiftSignupForm } from "@/components/gift-signup-form";
import { MarkdownBody } from "@/lib/markdown";
import { PostMedia } from "@/components/post-media";
import { previewFromBody } from "@/lib/posts/title";
import { getOptionalUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { getPublicGift, recordGiftVisit } from "@/lib/gifts";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function q(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const v = sp[key];
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

export default async function PresentePublicoPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const gift = await getPublicGift(slug);
  if (!gift) notFound();

  const h = await headers();
  await recordGiftVisit({
    giftSlug: gift.slug ?? slug,
    userAgent: h.get("user-agent"),
    referrer: h.get("referer"),
    utmSource: q(sp, "utm_source"),
    utmMedium: q(sp, "utm_medium"),
    utmCampaign: q(sp, "utm_campaign"),
    utmContent: q(sp, "utm_content"),
  });

  const user = await getOptionalUser();
  const profile = user
    ? await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { welcomeSeenAt: true, displayName: true },
      })
    : null;

  const title =
    gift.title?.trim() || previewFromBody(gift.body, 90) || "Presente";
  const authorName = gift.author.profile?.displayName ?? "Builders Club";

  return (
    <div className="relative min-h-dvh px-4 py-10">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle variant="icon" />
      </div>
      <main className="mx-auto w-full max-w-xl">
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

        <article className="post-card mt-6 p-6">
          <p className="text-xs text-muted">{authorName}</p>
          <h1 className="mt-2 font-[family-name:var(--font-outfit)] text-2xl font-bold tracking-tight">
            {title}
          </h1>
          <div className="mt-4">
            <MarkdownBody body={gift.body} />
          </div>
          <PostMedia
            imageUrl={gift.imageUrl}
            videoUrl={gift.videoUrl}
            linkUrl={gift.linkUrl}
            priority
          />
        </article>

        {!user ? (
          <div className="mt-8">
            <GiftSignupForm />
          </div>
        ) : null}
      </main>
    </div>
  );
}
