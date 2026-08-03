import type { ReactNode } from "react";
import Link from "next/link";
import { ATUALIZADO_EM, OPERADOR_LEGAL } from "@/lib/legal";

export function PaginaLegal({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-sm text-muted">
        <Link href="/login" className="hover:text-accent">
          ← {OPERADOR_LEGAL.produto}
        </Link>
      </p>
      <h1 className="mt-6 font-[family-name:var(--font-outfit)] text-3xl font-bold tracking-tight text-foreground">
        {titulo}
      </h1>
      <p className="mt-2 text-sm text-muted">
        Última atualização: {ATUALIZADO_EM}
      </p>
      <div className="mt-10 space-y-6 text-sm leading-relaxed text-foreground/85">
        {children}
      </div>
      <p className="mt-12 border-t border-border pt-6 text-xs text-muted">
        Operador: {OPERADOR_LEGAL.nome} ·{" "}
        <a
          href={`mailto:${OPERADOR_LEGAL.emailPrivacidade}`}
          className="text-accent hover:underline"
        >
          {OPERADOR_LEGAL.emailPrivacidade}
        </a>
      </p>
      <p className="mt-3 text-xs text-muted">
        <Link href="/termos" className="hover:text-accent hover:underline">
          Termos de Uso
        </Link>
        {" · "}
        <Link href="/privacidade" className="hover:text-accent hover:underline">
          Privacidade
        </Link>
      </p>
    </main>
  );
}
