"use client";

import { useEffect, type ReactNode } from "react";
import type { UpgradeFunnelPlan } from "@/lib/membership/upgrade-funnel";

function motivoAtual(): string | null {
  return new URLSearchParams(window.location.search).get("motivo");
}

function registrar(event: {
  step: "planos_view" | "checkout_click";
  plan?: UpgradeFunnelPlan;
}) {
  const body = JSON.stringify({ ...event, motivo: motivoAtual() });
  if (navigator.sendBeacon?.("/api/funil/upgrade", body)) return;

  void fetch("/api/funil/upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Métrica de apoio: falhar não pode bloquear a página nem o checkout.
  });
}

/** Roda no navegador: prefetch do Next/Vercel não vira visualização. */
export function PlanosViewTracker() {
  useEffect(() => registrar({ step: "planos_view" }), []);
  return null;
}

export function TrackedCheckoutLink({
  href,
  plan,
  className,
  children,
}: {
  href: string;
  plan: UpgradeFunnelPlan;
  className: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => registrar({ step: "checkout_click", plan })}
    >
      {children}
    </a>
  );
}
