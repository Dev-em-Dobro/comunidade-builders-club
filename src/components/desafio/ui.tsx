import Link from "next/link";
import type { ReactNode } from "react";
import { PHASES, WEEKS } from "@/lib/desafio/calendario";

export const panel = "rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5";
export const field = "input mt-1 block min-h-11 min-w-0";
export const link = "font-medium text-accent underline-offset-4 hover:underline";
export const eyebrow = "text-xs font-semibold uppercase tracking-[0.08em] text-muted";
export const brandEyebrow = "text-xs font-semibold uppercase tracking-[0.08em] text-accent";
export const displayTitle = "font-[family-name:var(--font-outfit)] font-bold tracking-tight";

export function ChallengeHeading({ eyebrow: kicker = "Desafio 45 dias", title, details, aside }: {
  eyebrow?: string; title: string; details?: string; aside?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 space-y-1.5">
        <p className={brandEyebrow}>{kicker}</p>
        <h1 className="page-title">{title}</h1>
        {details && <p className="text-[15px] text-muted">{details}</p>}
      </div>
      {aside && <div className="flex flex-wrap items-center gap-3">{aside}</div>}
    </header>
  );
}

const TABS = [
  ["Hoje", "/desafio"],
  ["Calendário", "/desafio/calendario"],
  ["Contatos quentes", "/desafio/contatos"],
  ["Check-in", "/desafio/checkin"],
  ["Ranking", "/desafio/ranking"],
] as const;

export function ChallengeNav({ current, contacts, staff }: { current: string; contacts?: number; staff?: boolean }) {
  return (
    <nav aria-label="Desafio 45 dias" className="-mx-1 flex gap-1 overflow-x-auto border-b border-border px-1">
      {TABS.map(([label, href]) => {
        const active = current === href;
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={`-mb-px inline-flex min-h-11 shrink-0 items-center border-b-2 px-3 text-sm transition-colors ${
              active ? "border-accent font-semibold text-foreground" : "border-transparent text-muted hover:text-foreground"
            }`}>
            {label}{href === "/desafio/contatos" && contacts !== undefined ? ` (${contacts})` : ""}
          </Link>
        );
      })}
      {staff && (
        <Link href="/admin/desafio" className="-mb-px ml-auto inline-flex min-h-11 shrink-0 items-center border-b-2 border-transparent px-3 text-sm text-muted hover:text-foreground">
          Painel da equipe
        </Link>
      )}
    </nav>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}{children}
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

export function YesNo({ name, label, yes = "Sim", no = "Não" }: { name: string; label: string; yes?: string; no?: string }) {
  return (
    <Field label={label}>
      <select name={name} className={field} required defaultValue="">
        <option value="" disabled>Selecione</option>
        <option value="sim">{yes}</option>
        <option value="nao">{no}</option>
      </select>
    </Field>
  );
}

export type FarolColor = "green" | "yellow" | "red" | "upcoming";

const FAROL_STYLE: Record<FarolColor, [string, string]> = {
  green: ["bg-[#dcfce7] text-[#166534]", "bg-[#16a34a]"],
  yellow: ["bg-[#fef3c7] text-[#92400e]", "bg-[#d97706]"],
  red: ["bg-[#fee2e2] text-[#991b1b]", "bg-[#dc2626]"],
  upcoming: ["bg-surface text-muted", "bg-slate-400"],
};

export function Farol({ color, label, small }: { color: FarolColor; label: string; small?: boolean }) {
  const [pill, dot] = FAROL_STYLE[color];
  return (
    <span className={`inline-flex shrink-0 items-center gap-2 rounded-full font-semibold ${pill} ${small ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"}`}>
      <span aria-hidden="true" className={`size-2 rounded-full ${dot}`} />{label}
    </span>
  );
}

export function GoalBar({ label, value, total, hint, pending }: {
  label: string; value: number; total: number; hint?: string; pending?: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between gap-3 text-sm">
        <span className="font-semibold">{label}</span>
        {pending
          ? <span className="text-muted">{pending}</span>
          : <span className="text-muted"><strong className="text-foreground">{value}</strong> / {total}</span>}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface" role="img"
        aria-label={pending ? `${label}: ${pending}` : `${label}: ${value} de ${total}`}>
        {!pending && <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />}
      </div>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Star() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="#16a34a" stroke="#16a34a" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" />
    </svg>
  );
}

function phaseDates(phase: number) {
  const weeks = WEEKS.filter((week) => week.phase === phase);
  const fmt = (date: string) => `${Number(date.slice(8, 10))}/${Number(date.slice(5, 7))}`;
  return `${fmt(weeks[0]!.start)}–${fmt(weeks.at(-1)!.end)}`;
}

/** Faixa das 4 fases; concluída em verde com estrela. */
export function PhaseStrip({ currentPhase, today }: { currentPhase: number | null; today: string }) {
  return (
    <section aria-label="Fases do desafio" className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {PHASES.map((name, index) => {
        const phase = index + 1;
        const lastDay = WEEKS.filter((week) => week.phase === phase).at(-1)!.end;
        const done = today > lastDay;
        const current = currentPhase === phase && !done;
        return (
          <div key={name} aria-current={current ? "step" : undefined}
            className={`flex flex-col gap-0.5 rounded-xl px-3.5 py-3 ${
              current ? "border border-accent bg-accent/10"
                : done ? "border border-[#86efac] bg-[#dcfce7] text-[#14532d]"
                : "border border-dashed border-border"
            }`}>
            <span className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${
              current ? "text-accent-hover" : done ? "text-[#166534]" : "text-muted"
            }`}>
              {done && <Star />}Fase {phase}{done ? " · concluída" : current ? " · agora" : ""}
            </span>
            <span className={`${displayTitle} text-base`}>{name}</span>
            <span className={`text-[13px] ${done ? "text-[#166534]" : "text-muted"}`}>{phaseDates(phase)}</span>
          </div>
        );
      })}
    </section>
  );
}

export function StatCard({ label, value, detail }: { label: string; value: ReactNode; detail?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className={`${displayTitle} text-[28px] leading-tight`}>{value}</span>
      {detail && <span className="text-xs text-muted">{detail}</span>}
    </div>
  );
}

export function Check({ done }: { done: boolean }) {
  return (
    <span aria-hidden="true" className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full ${
      done ? "bg-accent text-accent-foreground" : "border-[1.5px] border-border"
    }`}>
      {done && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5 9-10" />
        </svg>
      )}
    </span>
  );
}

export const COLD_UNAVAILABLE = "Números do Orion indisponíveis agora";
export const COLD_NOT_FOUND = "Conta Orion não encontrada com este e-mail";

/** Aviso sobre as frias do Orion; `null` quando os números chegaram. */
export function coldNotice(status: "ok" | "nao-encontrado" | "indisponivel") {
  return status === "ok" ? null : status === "nao-encontrado" ? COLD_NOT_FOUND : COLD_UNAVAILABLE;
}
