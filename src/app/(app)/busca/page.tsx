import Link from "next/link";
import { requirePaidMemberOrRedirect } from "@/lib/membership/require-member";
import { hrefPlanos } from "@/lib/membership/capabilities";
import { searchAll } from "@/lib/search";
import { PostCard } from "@/components/post-card";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function BuscaPage({ searchParams }: Props) {
  const member = await requirePaidMemberOrRedirect(hrefPlanos({ motivo: "busca" }));

  const { q = "" } = await searchParams;
  const results = q.trim().length >= 2 ? await searchAll(q) : null;

  return (
    <>
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold">
        Busca
      </h1>
      <form className="mt-4 flex gap-2">
        <input
          name="q"
          className="input"
          defaultValue={q}
          placeholder="Posts, membros, spaces…"
          minLength={2}
        />
        <button type="submit" className="btn-primary shrink-0">
          Buscar
        </button>
      </form>

      {results ? (
        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Spaces ({results.spaces.length})
            </h2>
            <ul className="mt-2 space-y-1">
              {results.spaces.map((s) => (
                <li key={s.id}>
                  <Link href={`/spaces/${s.slug}`} className="text-accent hover:underline">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Membros ({results.members.length})
            </h2>
            <ul className="mt-2 space-y-1">
              {results.members.map((m) => (
                <li key={m.id} className="text-sm">
                  {m.displayName}
                  {m.bio ? (
                    <span className="text-muted"> — {m.bio.slice(0, 80)}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Posts ({results.posts.length})
            </h2>
            <div className="mt-2 space-y-3">
              {results.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">Digite pelo menos 2 caracteres.</p>
      )}
    </>
  );
}
