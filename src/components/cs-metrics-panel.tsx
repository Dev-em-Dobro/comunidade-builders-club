"use client";

import { useEffect, useId, useState } from "react";
import type { CsCard, CsMetrics, CsPerson } from "@/lib/admin/cs-metrics-types";

function formatEntrada(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

export function CsMetricsPanel({ metrics }: { metrics: CsMetrics }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = metrics.cards.find((c) => c.id === openId) ?? null;

  const pagante = metrics.cards.filter((c) => c.group === "pagante");
  const free = metrics.cards.filter((c) => c.group === "free");

  return (
    <div className="mt-6 space-y-8">
      <p className="text-sm text-muted">
        Reunião de CS · semana fechada <strong>{metrics.closedWeekLabel}</strong>{" "}
        · recorte {metrics.cohortLabel}. Pagante e Free não compartilham
        denominador.
      </p>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Pagante (Pro + Elite)
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pagante.map((card) => (
            <CsStatCard
              key={card.id}
              card={card}
              selected={openId === card.id}
              onOpen={() => setOpenId(card.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Free
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {free.map((card) => (
            <CsStatCard
              key={card.id}
              card={card}
              selected={openId === card.id}
              onOpen={() => setOpenId(card.id)}
            />
          ))}
        </div>
      </section>

      {open ? (
        <CsPeopleDialog card={open} onClose={() => setOpenId(null)} />
      ) : null}
    </div>
  );
}

function CsStatCard({
  card,
  selected,
  onOpen,
}: {
  card: CsCard;
  selected: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={selected}
      className={`cursor-pointer rounded-2xl border bg-card p-4 text-left transition-colors hover:border-accent/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        selected ? "border-accent" : "border-border"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {card.title}
      </p>
      <p className="mt-1 font-[family-name:var(--font-outfit)] text-2xl font-bold tracking-tight">
        {card.value}
      </p>
      {card.series && card.series.length > 0 ? (
        <WeekSeries series={card.series} />
      ) : null}
      <p className="mt-2 text-xs text-muted">{card.hint}</p>
    </button>
  );
}

function WeekSeries({
  series,
}: {
  series: NonNullable<CsCard["series"]>;
}) {
  const max = Math.max(1, ...series.map((s) => s.y));
  return (
    <ol className="mt-3 flex items-end gap-1.5" aria-label="Últimas 4 semanas">
      {series.map((s) => {
        const h = Math.max(6, Math.round((s.y / max) * 28));
        return (
          <li key={s.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span
              className="w-full rounded-sm bg-accent/80"
              style={{ height: h }}
              title={`${s.label}: ${s.x} de ${s.y}`}
            />
            <span className="w-full truncate text-center text-[10px] tabular-nums text-muted">
              {s.x}/{s.y}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function CsPeopleDialog({
  card,
  onClose,
}: {
  card: CsCard;
  onClose: () => void;
}) {
  const titleId = useId();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-foreground/40 backdrop-blur-[2px]"
        aria-label="Fechar lista"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-card shadow-xl"
      >
        <div className="border-b border-border px-5 py-4">
          <h2
            id={titleId}
            className="font-[family-name:var(--font-outfit)] text-lg font-semibold"
          >
            {card.title}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {card.value}
            {card.unavailable ? " · indisponível" : null}
          </p>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
          {card.people.length === 0 ? (
            <li className="py-6 text-sm text-muted">
              {card.unavailable
                ? "Sem cruzamento com o Orion neste ambiente."
                : "Ninguém neste recorte. Zero vale."}
            </li>
          ) : (
            card.people.map((p) => <PersonRow key={p.userId} person={p} />)
          )}
        </ul>
        <div className="border-t border-border px-5 py-3">
          <button
            type="button"
            className="btn-ghost cursor-pointer text-sm"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function PersonRow({ person }: { person: CsPerson }) {
  return (
    <li className="flex items-start justify-between gap-3 border-b border-border/60 py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{person.displayName}</p>
        <p className="truncate text-xs text-muted">
          {person.email} · entrada {formatEntrada(person.entrada)}
          {person.note ? ` · ${person.note}` : null}
        </p>
      </div>
      {person.inNumerator ? (
        <span className="shrink-0 rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
          sim
        </span>
      ) : (
        <span className="shrink-0 rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
          não
        </span>
      )}
    </li>
  );
}
