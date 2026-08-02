"use client";

import { useState, useTransition } from "react";
import { bulkAddAllowedEmailsAction } from "@/actions/admin";

export function AdminBulkAllowlist() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{
    added: number;
    existing: number;
    invalid: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-3 max-w-xl space-y-2"
      action={(fd) => {
        setError(null);
        setResult(null);
        start(async () => {
          try {
            const r = await bulkAddAllowedEmailsAction(fd);
            setResult(r);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Falha no bulk.");
          }
        });
      }}
    >
      <textarea
        name="emails"
        className="input min-h-32 font-mono text-xs"
        placeholder={"aluno1@email.com\naluno2@email.com"}
        required
      />
      <p className="text-xs text-muted">
        Um e-mail por linha, ou separados por vírgula.
      </p>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {result ? (
        <p className="text-sm text-accent" role="status">
          Adicionados: {result.added} · Já existiam: {result.existing}
          {result.invalid.length > 0
            ? ` · Inválidos: ${result.invalid.join(", ")}`
            : ""}
        </p>
      ) : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Importando…" : "Importar em massa"}
      </button>
    </form>
  );
}
