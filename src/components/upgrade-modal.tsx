"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UpgradeReason } from "@/lib/membership/capabilities";

const REASON_COPY: Record<UpgradeReason, { title: string; body: string }> = {
  space: {
    title: "Space exclusivo para membros",
    body: "Faça upgrade do Builders Club para entrar neste space e participar das conversas.",
  },
  materiais: {
    title: "Materiais para membros",
    body: "O arsenal, prompts, contratos e kits ficam liberados na versão completa do Builders Club.",
  },
  aulas: {
    title: "Aulas para membros",
    body: "Assista às aulas e marque progresso com o acesso completo do Builders Club.",
  },
  busca: {
    title: "Busca para membros",
    body: "Pesquisar posts e membros faz parte do acesso completo.",
  },
  publicar: {
    title: "Publicar é para membros",
    body: "Para criar publicações, comente e participe ativamente, faça o upgrade.",
  },
  comentar: {
    title: "Comentar é para membros",
    body: "Interações (comentários e respostas) ficam liberadas no acesso completo.",
  },
  reagir: {
    title: "Reagir é para membros",
    body: "Reações fazem parte do acesso completo do Builders Club.",
  },
  geral: {
    title: "Desbloqueie o Builders Club",
    body: "Você está no plano gratuito. Com o acesso completo, libera spaces, materiais, aulas e interações.",
  },
};

type UpgradeCtx = {
  isPaid: boolean;
  checkoutUrl: string;
  openUpgrade: (reason?: UpgradeReason) => void;
  requirePaid: (reason?: UpgradeReason) => boolean;
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
  checkoutUrl,
  children,
  autoOpen = false,
}: {
  isPaid: boolean;
  checkoutUrl: string;
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

  useEffect(() => {
    if (autoOpen && !isPaid) {
      setReason("geral");
      setOpen(true);
    }
  }, [autoOpen, isPaid]);

  const value = useMemo(
    () => ({ isPaid, checkoutUrl, openUpgrade, requirePaid }),
    [isPaid, checkoutUrl, openUpgrade, requirePaid],
  );

  const copy = REASON_COPY[reason];

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
            className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              Builders Club
            </p>
            <h2
              id="upgrade-title"
              className="mt-2 font-[family-name:var(--font-outfit)] text-xl font-bold"
            >
              {copy.title}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              {copy.body}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 text-center"
              >
                Comprar Builders Club
              </a>
              <button
                type="button"
                className="btn-ghost flex-1"
                onClick={() => setOpen(false)}
              >
                Agora não
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-muted">
              Oferta em definição — o link pode ser atualizado em breve.
            </p>
          </div>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}
