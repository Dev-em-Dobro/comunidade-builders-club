"use client";

import { useMemo, useState } from "react";
import type { StudentProgressRow } from "@/lib/admin/progress";

type LessonMeta = {
  id: string;
  title: string;
  moduleTitle: string;
};

export function ProgressDashboard({
  students,
  lessons,
  summary,
}: {
  students: Array<
    Omit<StudentProgressRow, "joinedAt" | "lastCompletedAt" | "lastPostAt"> & {
      joinedAt: string;
      lastCompletedAt: string | null;
      lastPostAt: string | null;
    }
  >;
  lessons: LessonMeta[];
  summary: {
    activeMembers: number;
    totalLessons: number;
    averagePercent: number;
    completedAll: number;
    notStarted: number;
    totalPosts: number;
    membersWithPosts: number;
  };
}) {
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return students;
    return students.filter(
      (s) =>
        s.displayName.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term),
    );
  }, [students, q]);

  return (
    <div className="mt-4 space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Alunos ativos" value={String(summary.activeMembers)} />
        <StatCard label="Aulas publicadas" value={String(summary.totalLessons)} />
        <StatCard
          label="Média de aulas"
          value={`${summary.averagePercent}%`}
        />
        <StatCard
          label="Concluíram / zerados"
          value={`${summary.completedAll} / ${summary.notStarted}`}
        />
        <StatCard label="Posts na comunidade" value={String(summary.totalPosts)} />
        <StatCard
          label="Alunos que postaram"
          value={String(summary.membersWithPosts)}
        />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="block min-w-[220px] flex-1 text-xs font-medium text-muted">
          Buscar aluno
          <input
            className="input mt-1.5"
            placeholder="Nome ou e-mail"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <p className="text-xs text-muted">
          Ordenado: menos aulas concluídas → menos posts
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">Nenhum aluno encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((s) => {
            const open = expanded === s.userId;
            return (
              <li
                key={s.userId}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <button
                  type="button"
                  className="flex w-full cursor-pointer flex-wrap items-center gap-3 text-left"
                  onClick={() =>
                    setExpanded((id) => (id === s.userId ? null : s.userId))
                  }
                  aria-expanded={open}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
                    {s.displayName.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {s.displayName}
                      {s.role === "admin" ? (
                        <span className="ml-2 rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                          Admin
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {s.email} · {s.postsCount}{" "}
                      {s.postsCount === 1 ? "post" : "posts"} ·{" "}
                      {s.commentsCount}{" "}
                      {s.commentsCount === 1 ? "comentário" : "comentários"}
                    </p>
                  </div>
                  <div className="w-full sm:w-48">
                    <div className="mb-1 flex justify-between text-[11px] text-muted">
                      <span>
                        {s.completedCount}/{s.totalLessons} aulas
                      </span>
                      <span className="font-semibold text-foreground">
                        {s.percent}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${s.percent}%` }}
                      />
                    </div>
                  </div>
                </button>

                {open ? (
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="text-xs text-muted">
                      Membro desde{" "}
                      {new Date(s.joinedAt).toLocaleDateString("pt-BR")}
                      {s.lastCompletedAt
                        ? ` · Última aula: ${new Date(s.lastCompletedAt).toLocaleString("pt-BR")}`
                        : " · Ainda não concluiu nenhuma aula"}
                      {s.lastPostAt
                        ? ` · Último post: ${new Date(s.lastPostAt).toLocaleString("pt-BR")}`
                        : " · Ainda não publicou"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-lg bg-surface px-2.5 py-1.5">
                        <strong>{s.postsCount}</strong> posts
                      </span>
                      <span className="rounded-lg bg-surface px-2.5 py-1.5">
                        <strong>{s.commentsCount}</strong> comentários
                      </span>
                      <span className="rounded-lg bg-surface px-2.5 py-1.5">
                        <strong>{s.reactionsCount}</strong> reações
                      </span>
                    </div>
                    {lessons.length === 0 ? (
                      <p className="mt-3 text-sm text-muted">
                        Nenhuma aula publicada.
                      </p>
                    ) : (
                      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                        {lessons.map((lesson) => {
                          const done = s.completedLessonIds.includes(lesson.id);
                          return (
                            <li
                              key={lesson.id}
                              className={`rounded-lg px-2.5 py-2 text-xs ${
                                done
                                  ? "bg-accent/10 text-foreground"
                                  : "bg-surface/60 text-muted"
                              }`}
                            >
                              <span className="font-medium">
                                {done ? "✓ " : "○ "}
                                {lesson.title}
                              </span>
                              <span className="mt-0.5 block text-[10px] opacity-70">
                                {lesson.moduleTitle}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-outfit)] text-2xl font-bold tracking-tight">
        {value}
      </p>
    </div>
  );
}
