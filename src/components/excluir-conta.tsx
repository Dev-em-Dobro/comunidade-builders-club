"use client";

/** F059 — área de exclusão de conta, separada do resto do perfil. */

import { useState, useTransition } from "react";
import { excluirContaAction } from "@/actions/profile";

const CONFIRMACAO = "EXCLUIR";

export function ExcluirConta() {
  const [aberto, setAberto] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function enviar(formData: FormData) {
    setErro(null);
    start(async () => {
      const resultado = await excluirContaAction(formData);
      if (resultado?.erro) setErro(resultado.erro);
    });
  }

  return (
    <section className="mt-12 rounded-2xl border border-red-500/30 bg-card p-5">
      <h2 className="text-base font-semibold text-foreground">
        Excluir minha conta
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Seu nome, e-mail, bio e foto são apagados e o acesso é encerrado na
        hora. O que você publicou continua na comunidade, assinado como
        &ldquo;Membro removido&rdquo; — assim as conversas em que outras pessoas
        responderam não ficam com buracos.{" "}
        <strong className="font-medium text-foreground">
          Não dá para desfazer.
        </strong>
      </p>

      {!aberto ? (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="btn-outline mt-4 border-red-500/40 text-red-600 hover:bg-red-500/10"
        >
          Quero excluir minha conta
        </button>
      ) : (
        <form action={enviar} className="mt-4 space-y-3">
          <label
            htmlFor="confirmacao"
            className="block text-sm text-foreground/85"
          >
            Digite <strong className="font-semibold">{CONFIRMACAO}</strong> para
            confirmar:
          </label>
          <input
            id="confirmacao"
            name="confirmacao"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            className="input max-w-xs"
            autoComplete="off"
            placeholder={CONFIRMACAO}
          />

          {erro ? <p className="text-sm text-red-600">{erro}</p> : null}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending || confirmacao.trim() !== CONFIRMACAO}
              className="btn-outline border-red-500/40 text-red-600 hover:bg-red-500/10"
            >
              {pending ? "Excluindo…" : "Excluir definitivamente"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAberto(false);
                setConfirmacao("");
                setErro(null);
              }}
              disabled={pending}
              className="btn-ghost"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
