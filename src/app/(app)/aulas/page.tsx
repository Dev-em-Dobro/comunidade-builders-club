import Link from "next/link";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import {
  listCompletedLessonIds,
  listPublishedModules,
} from "@/lib/aulas";
import { EmptyState } from "@/components/empty-state";

export default async function AulasPage() {
  const member = await requireActiveMemberOrRedirect();
  const [modules, completed] = await Promise.all([
    listPublishedModules(),
    listCompletedLessonIds(member.user.id),
  ]);

  return (
    <div className="feed-wrap">
      <h1 className="page-title">Aulas</h1>
      <p className="mt-2 text-sm text-muted">
        Conteúdo em vídeo da comunidade. Assista e marque como concluído.
      </p>

      {modules.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nenhum módulo publicado"
            description="Os administradores vão liberar as aulas em breve."
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-6">
          {modules.map((mod) => (
            <li key={mod.id} className="post-card">
              <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
                {mod.title}
              </h2>
              {mod.description ? (
                <p className="mt-1 text-sm text-muted">{mod.description}</p>
              ) : null}
              <ul className="mt-4 space-y-2">
                {mod.lessons.map((l, idx) => {
                  const done = completed.has(l.id);
                  return (
                    <li key={l.id}>
                      <Link
                        href={`/aulas/${mod.slug}/${l.slug}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-sm transition-colors hover:border-accent/40 hover:bg-surface"
                      >
                        <span>
                          <span className="text-muted">{idx + 1}. </span>
                          {l.title}
                        </span>
                        {done ? (
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                            Concluída
                          </span>
                        ) : (
                          <span className="text-xs text-accent">Assistir →</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
