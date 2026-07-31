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

export function PostCard({ post, showSpace = true }: PostCardProps) {
  const name = post.author.profile?.displayName ?? "Membro";

  return (
    <article className="post-card animate-[fadeIn_0.35s_ease-out]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-xs text-muted">
            {showSpace ? (
              <>
                <Link
                  href={`/spaces/${post.space.slug}`}
                  className="hover:text-accent"
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
            {post.pinnedAt ? " · Fixado" : null}
          </p>
        </div>
        <Link href={`/posts/${post.id}`} className="text-xs text-accent hover:underline">
          Abrir
        </Link>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p>
      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt=""
          className="mt-3 max-h-80 w-full rounded-lg object-cover"
          loading="lazy"
        />
      ) : null}
      {post.linkUrl ? (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block truncate text-sm text-accent hover:underline"
        >
          {post.linkUrl}
        </a>
      ) : null}
      {post.videoUrl ? (
        <a
          href={post.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-sm text-accent hover:underline"
        >
          Ver vídeo
        </a>
      ) : null}
      <p className="mt-3 text-xs text-muted">
        {post.reactionCount} reações · {post.commentCount} comentários
      </p>
    </article>
  );
}
