import Link from "next/link";
import { hrefPlanos } from "@/lib/membership/capabilities";
import {
  ofertaPro,
  PROMESSA_PRIMEIRO_CLIENTE,
} from "@/lib/membership/checkout";

/**
 * F069 — faixa de upgrade da tela de Boas-vindas.
 *
 * Entra **abaixo** da trilha, nunca dentro dela: "Primeiros passos" é
 * onboarding, não pitch (F063). É o único empurrão do produto que não
 * depende de a pessoa esbarrar num cadeado.
 *
 * Promessa e preço saem de `checkout.ts` — nada digitado à mão, para não
 * desatualizar como o "6x" que ficou para trás em produção.
 */
const GANHOS = [
  {
    titulo: "A formação inteira",
    detalhe: "Nicho, prospecção, abordagem e fechamento",
  },
  {
    titulo: "Skills e templates",
    detalhe: "Proposta, contrato e os kits de entrega",
  },
  {
    titulo: "A comunidade inteira",
    detalhe: "Comentar, reagir e publicar em todos os spaces",
  },
];

export function WelcomeUpgradeBanner() {
  const { installments, installmentPrice } = ofertaPro().pricing;

  return (
    <section className="mt-8 rounded-2xl border border-accent/30 bg-accent/[0.07] px-5 py-6 sm:px-7">
      <h2 className="font-[family-name:var(--font-outfit)] text-lg font-bold tracking-tight sm:text-xl">
        {PROMESSA_PRIMEIRO_CLIENTE}
      </h2>

      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {GANHOS.map((g) => (
          <li key={g.titulo}>
            <p className="text-sm font-semibold text-foreground">{g.titulo}</p>
            <p className="mt-0.5 text-sm leading-snug text-muted">
              {g.detalhe}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          A partir de{" "}
          <strong className="font-semibold text-foreground">
            {installments}× {installmentPrice}
          </strong>{" "}
          no PRO.
        </p>
        <Link
          href={hrefPlanos({ motivo: "boas-vindas" })}
          className="btn-primary sm:w-auto"
        >
          Ver os planos
        </Link>
      </div>
    </section>
  );
}
