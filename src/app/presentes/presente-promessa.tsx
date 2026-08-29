import Link from "next/link";
import { NOME_PRODUTO } from "@/lib/produto";
import { PROMESSA_PRIMEIRO_CLIENTE } from "@/lib/membership/checkout";

/**
 * F063 (decisão 1) — bloco da promessa na página do presente.
 *
 * Fecha a leitura e abre a oferta: nunca aparece antes do conteúdo, para
 * não cobrar pedágio por algo anunciado como presente. Renderizado depois
 * do <article> e antes do formulário de cadastro.
 *
 * Três variantes, por sessão:
 *   anônima     → bloco completo + os dois CTAs
 *   logada free → compacto (promessa + Ver os planos), sem "criar conta"
 *   logada paga → nada (já comprou)
 */
export function PresentePromessa({
  variante,
  formAnchorId,
}: {
  variante: "anonima" | "free";
  formAnchorId: string;
}) {
  if (variante === "free") {
    return (
      <aside className="mt-12 rounded-2xl border border-border/80 bg-card px-5 py-4">
        <p className="font-[family-name:var(--font-outfit)] text-base font-semibold">
          {PROMESSA_PRIMEIRO_CLIENTE}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          É o que o PRO e o Elite organizam: formação completa, skills,
          templates de proposta e contrato.{" "}
          <Link
            href="/planos"
            className="font-medium text-accent hover:underline"
          >
            Ver os planos
          </Link>
        </p>
      </aside>
    );
  }

  return (
    <aside className="mt-12 rounded-2xl border border-accent/30 bg-accent/[0.07] px-5 py-6 sm:px-7 sm:py-7">
      <p className="font-[family-name:var(--font-outfit)] text-xs font-semibold uppercase tracking-[0.12em] text-accent">
        {NOME_PRODUTO}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-outfit)] text-xl font-bold tracking-tight sm:text-2xl">
        Isto é uma amostra do que a gente faz
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        O Builders Club é a comunidade de quem está montando a própria
        operação de IA e automação: aulas, skills prontas, templates de
        proposta e contrato — e gente fechando cliente junto.
      </p>
      <p className="mt-4 font-[family-name:var(--font-outfit)] text-lg font-semibold">
        {PROMESSA_PRIMEIRO_CLIENTE}
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <a href={`#${formAnchorId}`} className="btn-primary sm:w-auto">
          Criar conta grátis
        </a>
        <Link href="/planos" className="btn-outline sm:w-auto">
          Ver os planos
        </Link>
      </div>
    </aside>
  );
}
