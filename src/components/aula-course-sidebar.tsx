"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  type AulaModuleCard,
  LockMark,
  progressPct,
  sidebarGroups,
} from "@/components/aulas-catalog";

export function AulaCourseSidebar({
  root,
  currentModuleSlug,
  currentLessonSlug,
  isPaid = true,
}: {
  root: AulaModuleCard;
  currentModuleSlug: string;
  currentLessonSlug: string;
  isPaid?: boolean;
}) {
  const groups = sidebarGroups(root);
  const sections = groups.flatMap((g) => g.sections);
  const currentSection =
    sections.find((s) =>
      s.lessons.some(
        (l) => l.slug === currentLessonSlug && s.slug === currentModuleSlug,
      ),
    )?.slug ?? sections[0]?.slug;
  const [openSlug, setOpenSlug] = useState(currentSection);

  useEffect(() => {
    setOpenSlug(currentSection);
  }, [currentSection]);

  return (
    <nav
      aria-label="Aulas do módulo"
      className="flex h-full flex-col gap-2 overflow-y-auto overscroll-contain"
    >
      {groups.map((group, groupIndex) => (
        <div key={group.id} className="flex flex-col gap-2">
          {group.title ? (
            <>
              {groupIndex > 0 ? (
                <div
                  className="mx-1 mt-2 border-t border-border"
                  aria-hidden
                />
              ) : null}
              <p className="px-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {group.title}
              </p>
            </>
          ) : null}
          {group.sections.map((section) => {
            const open = openSlug === section.slug;
            const pct = progressPct(section);
            return (
              <div
                key={section.id}
                className="shrink-0 overflow-hidden rounded-xl border border-border bg-card"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-3 text-left"
                  aria-expanded={open}
                  onClick={() => setOpenSlug(open ? "" : section.slug)}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/40 text-[11px] font-semibold text-accent">
                    {pct}%
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">
                    {section.title}
                  </span>
                  {!isPaid && !section.freeAccess ? (
                    <LockMark className="h-3.5 w-3.5 shrink-0 text-muted" />
                  ) : null}
                </button>
                {open ? (
                  <ul className="border-t border-border px-3 pb-3 pt-1">
                    {section.lessons.map((l) => {
                      const active =
                        l.slug === currentLessonSlug &&
                        l.moduleSlug === currentModuleSlug;
                      const locked = !isPaid && !l.freeAccess;
                      return (
                        <li key={l.id}>
                          <Link
                            href={`/aulas/${l.moduleSlug}/${l.slug}`}
                            className={`flex items-start gap-2.5 rounded-lg px-2 py-2 text-sm leading-snug ${
                              active
                                ? "font-semibold text-accent"
                                : "text-foreground hover:bg-surface/70"
                            }`}
                          >
                            <span
                              className={`mt-[0.4em] box-border size-2 shrink-0 rounded-full ${
                                l.completed
                                  ? "border-2 border-accent bg-accent"
                                  : active
                                    ? "border-2 border-accent bg-transparent"
                                    : "border border-muted bg-transparent"
                              }`}
                              aria-hidden
                            />
                            <span className="min-w-0 flex-1">{l.title}</span>
                            {locked ? (
                              <LockMark className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
