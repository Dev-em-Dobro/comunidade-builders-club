import Link from "next/link";

type PostCardProps = {
  post: {
    id: string;
    body: string;
    imageUrl: string | null;
    linkUrl: string | null;
    videoUrl: string | null;
    pinnedAt: Date | null;
    commentCount: number;
    reactionCount: number;
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

  return (
    <article className="post-card animate-[fadeIn_0.35s_ease-out]">
      <div className="flex gap-3">
        <Avatar name={name} url={avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {name}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {showSpace ? (
                  <>
                    <Link
                      href={`/spaces/${post.space.slug}`}
                      className="font-medium text-accent/90 hover:underline"
                    >
                      {post.space.name}
                    </Link>
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
          </div>

          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
            {post.body}
          </p>

          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt=""
              className="mt-3 max-h-96 w-full rounded-xl object-cover"
              loading="lazy"
            />
          ) : null}
          {post.linkUrl ? (
            <a
              href={post.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block truncate rounded-xl border border-border bg-surface/50 px-3 py-2 text-sm text-accent hover:bg-surface"
            >
              {post.linkUrl}
            </a>
          ) : null}
          {post.videoUrl ? (
            <a
              href={post.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex text-sm font-medium text-accent hover:underline"
            >
              Ver vídeo →
            </a>
          ) : null}

          <div className="mt-4 flex items-center gap-4 border-t border-border/70 pt-3 text-xs text-muted">
            <span>
              {post.reactionCount}{" "}
              {post.reactionCount === 1 ? "reação" : "reações"}
            </span>
            <span>
              {post.commentCount}{" "}
              {post.commentCount === 1 ? "comentário" : "comentários"}
            </span>
            <Link
              href={`/posts/${post.id}`}
              className="ml-auto font-medium text-accent hover:underline"
            >
              Abrir
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
