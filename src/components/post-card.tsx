import Link from "next/link";
import { previewFromBody } from "@/lib/posts/title";

type PostCardProps = {
  post: {
    id: string;
    title: string;
    body: string;
    imageUrl: string | null;
    pinnedAt: Date | null;
    commentCount: number;
    reactionCount: number;
    viewCount: number;
    createdAt: Date;
    space: { slug: string; name: string };
    author: {
      profile: { displayName: string; avatarUrl: string | null } | null;
    };
  };
  showSpace?: boolean;
};

function Avatar({
  name,
  url,
}: {
  name: string;
  url: string | null | undefined;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-surface"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export function PostCard({ post, showSpace = true }: PostCardProps) {
  const name = post.author.profile?.displayName ?? "Membro";
  const avatarUrl = post.author.profile?.avatarUrl;
  const title =
    post.title?.trim() || previewFromBody(post.body, 90) || "Publicação";
  const preview = previewFromBody(post.body, 160);

  return (
    <article className="post-card animate-[fadeIn_0.35s_ease-out] p-0">
      <Link
        href={`/posts/${post.id}`}
        className="block p-5 transition-colors hover:bg-surface/40"
      >
        <div className="flex gap-3">
          <Avatar name={name} url={avatarUrl} />
          <div className="min-w-0 flex-1">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {name}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {showSpace ? (
                  <>
                    <span className="font-medium text-accent/90">
                      {post.space.name}
                    </span>
                    {" · "}
                  </>
                ) : null}
                {post.createdAt.toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {post.pinnedAt ? (
                  <span className="ml-1 rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                    Fixado
                  </span>
                ) : null}
              </p>
            </div>

            <h2 className="mt-3 font-[family-name:var(--font-outfit)] text-lg font-semibold leading-snug tracking-tight text-foreground">
              {title}
            </h2>
            {preview && preview !== title ? (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                {preview}
              </p>
            ) : null}

            {post.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.imageUrl}
                alt=""
                className="mt-3 max-h-40 w-full rounded-xl object-cover"
                loading="lazy"
              />
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/70 pt-3 text-xs text-muted">
              <span>
                {post.viewCount}{" "}
                {post.viewCount === 1 ? "leitura" : "leituras"}
              </span>
              <span>
                {post.reactionCount}{" "}
                {post.reactionCount === 1 ? "reação" : "reações"}
              </span>
              <span>
                {post.commentCount}{" "}
                {post.commentCount === 1 ? "comentário" : "comentários"}
              </span>
              <span className="ml-auto font-medium text-accent">Ler →</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
