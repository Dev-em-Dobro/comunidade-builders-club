import Link from "next/link";
import { requireAdminOrRedirect } from "@/lib/membership/require-member";
import { listStudentsLessonProgress } from "@/lib/admin/progress";
import { ProgressDashboard } from "@/components/progress-dashboard";

export default async function AdminProgressoPage() {
  await requireAdminOrRedirect();
  const { lessons, students, summary } = await listStudentsLessonProgress();

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
        Acompanhe a conclusão das aulas publicadas do Builders Club.
      </p>

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
        }))}
      />
    </div>
  );
}
