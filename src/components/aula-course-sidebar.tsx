"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  type AulaModuleCard,
  leafModules,
  progressPct,
} from "@/components/aulas-catalog";

export function AulaCourseSidebar({
  root,
  currentModuleSlug,
  currentLessonSlug,
}: {
  root: AulaModuleCard;
  currentModuleSlug: string;
  currentLessonSlug: string;
}) {
  const sections = leafModules(root);
  const currentSection =
    sections.find((s) =>
      s.lessons.some((l) => l.slug === currentLessonSlug && s.slug === currentModuleSlug),
    )?.slug ?? sections[0]?.slug;
  const [openSlug, setOpenSlug] = useState(currentSection);

  useEffect(() => {
    setOpenSlug(currentSection);
  }, [currentSection]);

  return (
    <nav
      aria-label="Aulas do módulo"
      className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto lg:max-h-[min(70vh,36rem)]"
    >
      {sections.map((section) => {
        const open = openSlug === section.slug;
        const pct = progressPct(section);
        return (
          <div
            key={section.id}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <button
              type="button"
              className="flex w-full items-center gap-3 px-3 py-3 text-left"
              aria-expanded={open}
              onClick={() =>
                setOpenSlug(open ? "" : section.slug)
              }
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/40 text-[11px] font-semibold text-accent">
                {pct}%
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">
                {section.title}
              </span>
            </button>
            {open ? (
              <ul className="border-t border-border px-3 pb-3 pt-1">
                {section.lessons.map((l) => {
                  const active =
                    l.slug === currentLessonSlug &&
                    l.moduleSlug === currentModuleSlug;
                  return (
                    <li key={l.id}>
                      <Link
                        href={`/aulas/${l.moduleSlug}/${l.slug}`}
                        className={`flex items-start gap-2 rounded-lg px-2 py-2 text-sm leading-snug ${
                          active
                            ? "font-semibold text-accent"
                            : "text-foreground hover:bg-surface/70"
                        }`}
                      >
                        <span
                          className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                            l.completed
                              ? "bg-accent"
                              : active
                                ? "ring-2 ring-accent"
                                : "border border-muted"
                          }`}
                          aria-hidden
                        />
                        <span>{l.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
