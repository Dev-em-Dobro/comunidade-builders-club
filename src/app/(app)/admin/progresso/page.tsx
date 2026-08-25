import Link from "next/link";
import { requireAdminOrRedirect } from "@/lib/membership/require-member";
import { listStudentsLessonProgress } from "@/lib/admin/progress";
import { loadCsMetrics } from "@/lib/admin/cs-metrics";
import { ProgressDashboard } from "@/components/progress-dashboard";
import { CsMetricsPanel } from "@/components/cs-metrics-panel";

export const dynamic = "force-dynamic";

export default async function AdminProgressoPage() {
  await requireAdminOrRedirect();
  const [{ lessons, students, summary }, cs] = await Promise.all([
    listStudentsLessonProgress(),
    loadCsMetrics(),
  ]);

  return (
    <div className="feed-wrap">
      <Link
        href="/admin"
        className="cursor-pointer text-sm font-medium text-accent hover:underline"
      >
        ← Administração
      </Link>
      <h1 className="page-title mt-4">Progresso dos alunos</h1>
      <p className="mt-1.5 text-sm text-muted">
        Métricas de CS da semana (recorte desde 24/08/2026) e, abaixo, aulas
        concluídas e atividade na comunidade.
      </p>

      <CsMetricsPanel metrics={cs} />

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted">
        Aulas e atividade
      </h2>
      <ProgressDashboard
        summary={summary}
        lessons={lessons.map((l) => ({
          id: l.id,
          title: l.title,
          moduleTitle: l.module.title,
        }))}
        students={students.map((s) => ({
          ...s,
          joinedAt: s.joinedAt.toISOString(),
          lastCompletedAt: s.lastCompletedAt?.toISOString() ?? null,
          lastPostAt: s.lastPostAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
