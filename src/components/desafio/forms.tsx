"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";

type State = { message: string; ok?: boolean };
type Action = (state: State, form: FormData) => Promise<State>;

export function ChallengeForm({ action, children, submit, className, resetOnSuccess, disabled, footer }: {
  action: Action; children?: ReactNode; submit: string; className?: string;
  resetOnSuccess?: boolean; disabled?: boolean; footer?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, { message: "" });
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={className}>
      <fieldset disabled={pending} className="min-w-0 space-y-4">
        {children}
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary min-h-11" type="submit" disabled={disabled}>{pending ? "Salvando…" : submit}</button>
          {footer}
        </div>
      </fieldset>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`mt-2 text-sm ${state.ok ? "text-accent-hover" : "text-[#991b1b]"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

/** Botão de ação rápida (um form com campos ocultos). */
export function ActionButton({ action, fields, children, className, label, confirm }: {
  action: Action; fields: Record<string, string>; children: ReactNode; className?: string;
  label?: string; confirm?: string;
}) {
  const [state, formAction, pending] = useActionState(action, { message: "" });
  return (
    <form action={formAction} className="contents" onSubmit={(event) => {
      if (confirm && !window.confirm(confirm)) event.preventDefault();
    }}>
      {Object.entries(fields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
      <button type="submit" disabled={pending} aria-label={label} className={className}>{pending ? "…" : children}</button>
      {state.message && !state.ok && <span role="alert" className="basis-full text-xs text-[#991b1b]">{state.message}</span>}
    </form>
  );
}

/** Compromissos do cadastro: o botão só habilita com todos marcados. */
export function CommitmentsGate({ items, children }: { items: readonly string[]; children: (ready: boolean) => ReactNode }) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const missing = checked.filter((value) => !value).length;
  return (
    <>
      <fieldset className="space-y-2.5 rounded-xl border border-border px-4 py-3.5">
        <legend className="px-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">Meus compromissos</legend>
        {items.map((item, index) => (
          <label key={item} className="flex min-h-9 items-start gap-2.5 text-sm leading-snug">
            <input type="checkbox" name="commitments" value={index} required checked={checked[index]}
              onChange={() => setChecked((prev) => prev.map((value, i) => (i === index ? !value : value)))}
              className="mt-0.5 size-4 shrink-0 accent-[var(--bc-accent)]" />
            <span>{item}</span>
          </label>
        ))}
      </fieldset>
      {children(missing === 0)}
      <p className="text-xs text-muted">{missing > 0 ? `Marque os ${items.length} compromissos para enviar.` : "Tudo certo — pode enviar."}</p>
    </>
  );
}

/** Formulário de cadastro com gate dos compromissos. */
export function EnrollmentForm({ action, commitments, children }: {
  action: Action; commitments: readonly string[]; children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, { message: "" });
  return (
    <form action={formAction} className="space-y-4">
      <fieldset disabled={pending} className="min-w-0 space-y-4">
        {children}
        <CommitmentsGate items={commitments}>
          {(ready) => (
            <button className="btn-primary min-h-11 w-full" type="submit" disabled={!ready}>
              {pending ? "Enviando…" : "Enviar cadastro"}
            </button>
          )}
        </CommitmentsGate>
      </fieldset>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-accent-hover" : "text-[#991b1b]"}`}>{state.message}</p>
      )}
    </form>
  );
}
