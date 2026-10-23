"use client";

import { useLayoutEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { aceitarTermosEliteAction } from "@/actions/legal/aceitar-termos-elite";
import { VERSAO_TERMOS_ELITE } from "@/lib/legal/termos-elite";

type Props = {
  datas: { compra: string; termino: string } | null;
};

/** F115 — dialog nativo impede interação com o app até o aceite persistir. */
export function TermosEliteModal({ datas }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [aceitou, setAceitou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useLayoutEffect(() => {
    const current = dialog.current;
    if (current && !current.open) current.showModal();
  }, []);

  function confirmar() {
    if (!aceitou) return;
    setErro(null);
    start(async () => {
      const result = await aceitarTermosEliteAction(aceitou);
      if (!result.ok) {
        setErro(result.erro);
        return;
      }
      router.refresh();
    });
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="termos-elite-titulo"
      aria-describedby="termos-elite-descricao"
      onCancel={(event) => event.preventDefault()}
      className="fixed left-1/2 top-1/2 m-0 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card p-5 text-foreground shadow-xl backdrop:bg-black/70 sm:p-7"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        Builders Club · Elite
      </p>
      <h2 id="termos-elite-titulo" className="mt-2 text-xl font-bold tracking-tight">
        Termos de uso do Elite
      </h2>
      <div id="termos-elite-descricao" className="mt-4 space-y-4 text-sm leading-relaxed">
        <p>
          Leia os termos completos abaixo antes de continuar. Eles explicam o que
          permanece disponível e quando termina o acompanhamento do Elite.
        </p>
        <section>
          <h3 className="font-semibold">Aulas gravadas: acesso vitalício</h3>
          <p>
            As aulas gravadas incluídas no Elite têm acesso <strong>vitalício</strong>.
            O fim do período de acompanhamento não encerra o acesso a essas aulas.
          </p>
        </section>
        <section>
          <h3 className="font-semibold">Acompanhamento: 1 ano</h3>
          <p>
            Lives, suporte e mentoria são o acompanhamento do Elite. Esse
            acompanhamento dura <strong>1 ano a partir da compra do Elite</strong>.
            Ele não é vitalício. Após esse prazo, as aulas gravadas continuam
            disponíveis, mas lives, suporte e mentoria deixam de fazer parte do
            acesso contratado.
          </p>
        </section>
        <section>
          <h3 className="font-semibold">Seu prazo</h3>
          {datas ? (
            <p>
              Sua compra do Elite foi em <strong>{datas.compra}</strong>. Seu
              acompanhamento termina em <strong>{datas.termino}</strong>.
            </p>
          ) : (
            <p>
              <strong>Data de término pendente de confirmação.</strong> A data
              da sua compra do Elite não está registrada com segurança nesta
              plataforma. O prazo é de 1 ano a partir da compra. Consulte seu
              comprovante ou entre em contato com o suporte para confirmar a
              data exata de término do seu acompanhamento.
            </p>
          )}
        </section>
        <p className="text-xs text-muted">Versão dos termos: {VERSAO_TERMOS_ELITE}</p>
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 text-sm font-medium">
        <input
          type="checkbox"
          checked={aceitou}
          onChange={(event) => setAceitou(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
        />
        Li e aceito os termos de uso do Elite.
      </label>
      {erro ? <p className="mt-3 text-sm text-red-500" role="alert">{erro}</p> : null}
      <button
        type="button"
        onClick={confirmar}
        disabled={!aceitou || pending}
        className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Registrando aceite…" : "Aceitar e continuar"}
      </button>
    </dialog>
  );
}
