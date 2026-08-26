"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  hrefPlanos,
  UPGRADE_REASON_COPY,
  type UpgradeReason,
} from "@/lib/membership/capabilities";

type UpgradeCtx = {
  isPaid: boolean;
  isElite: boolean;
  openUpgrade: (reason?: UpgradeReason) => void;
  requirePaid: (reason?: UpgradeReason) => boolean;
  requireElite: (reason?: UpgradeReason) => boolean;
};

const Ctx = createContext<UpgradeCtx | null>(null);

export function useUpgrade() {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error("useUpgrade deve estar dentro de UpgradeProvider");
  }
  return v;
}

/** Safe para componentes que podem rodar fora do provider (retorna null). */
export function useUpgradeOptional() {
  return useContext(Ctx);
}

export function UpgradeProvider({
  isPaid,
  isElite = false,
  children,
  autoOpen = false,
}: {
  isPaid: boolean;
  isElite?: boolean;
  children: React.ReactNode;
  autoOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<UpgradeReason>("geral");

  const openUpgrade = useCallback((r: UpgradeReason = "geral") => {
    setReason(r);
    setOpen(true);
  }, []);

  const requirePaid = useCallback(
    (r: UpgradeReason = "geral") => {
      if (isPaid) return true;
      openUpgrade(r);
      return false;
    },
    [isPaid, openUpgrade],
  );

  const requireElite = useCallback(
    (r: UpgradeReason = "orion") => {
      if (isElite) return true;
      openUpgrade(r);
      return false;
    },
    [isElite, openUpgrade],
  );

  useEffect(() => {
    if (autoOpen && !isPaid) {
      setReason("geral");
      setOpen(true);
    }
  }, [autoOpen, isPaid]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const value = useMemo(
    () => ({
      isPaid,
      isElite,
      openUpgrade,
      requirePaid,
      requireElite,
    }),
    [isPaid, isElite, openUpgrade, requirePaid, requireElite],
  );

  const copy = UPGRADE_REASON_COPY[reason];
  const eliteOnly = isPaid && !isElite;
  const planosHref = hrefPlanos({
    motivo: reason,
    destaque: eliteOnly ? "elite" : undefined,
  });

  return (
    <Ctx.Provider value={value}>
      {children}
      {open ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/45 backdrop-blur-[2px]"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              Builders Club
            </p>
            <h2
              id="upgrade-title"
              className="mt-2 font-[family-name:var(--font-outfit)] text-xl font-bold sm:text-2xl"
            >
              {eliteOnly ? "Evolua para o Elite" : copy.title}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              {eliteOnly
                ? "Você já tem o PRO. O Elite libera Orion, reunião semanal em grupo e material extra."
                : copy.body}
            </p>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                className="btn-ghost cursor-pointer px-2 text-sm"
                onClick={() => setOpen(false)}
              >
                Agora não
              </button>
              <Link href={planosHref} className="btn-primary" onClick={() => setOpen(false)}>
                Ver planos
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}
