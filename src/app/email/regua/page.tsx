import type { Metadata } from "next";
import { PaginaLegal } from "@/components/pagina-legal";
import { NOME_PRODUTO } from "@/lib/produto";
import { optOutReguaEmailAction } from "@/actions/email-regua";

export const metadata: Metadata = {
  title: `Lembretes por e-mail · ${NOME_PRODUTO}`,
  description: `Parar de receber o e-mail quando você some do ${NOME_PRODUTO}.`,
};

export default async function EmailReguaPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; ok?: string; erro?: string }>;
}) {
  const { t, ok, erro } = await searchParams;

  if (ok === "1") {
    return (
      <PaginaLegal titulo="Lembretes desligados">
        <p>
          Você não receberá mais o e-mail de quando fica dois dias sem abrir o{" "}
          {NOME_PRODUTO}. O restante da conta continua igual.
        </p>
        <p>
          Para religar, entre na conta e abra{" "}
          <a href="/configuracoes" className="font-medium text-accent hover:underline">
            Configurações
          </a>
          .
        </p>
      </PaginaLegal>
    );
  }

  if (erro === "1" || !t) {
    return (
      <PaginaLegal titulo="Link inválido">
        <p>
          Este link de descadastro não é válido. Se ainda estiver recebendo o
          lembrete, abra{" "}
          <a href="/configuracoes" className="font-medium text-accent hover:underline">
            Configurações
          </a>{" "}
          com a conta logada e desligue por lá.
        </p>
      </PaginaLegal>
    );
  }

  return (
    <PaginaLegal titulo="Parar lembretes por e-mail">
      <p>
        Você deixa de receber o e-mail quando fica dois dias sem abrir o{" "}
        {NOME_PRODUTO}. Não muda aula, feed nem o sininho.
      </p>
      <form action={optOutReguaEmailAction} className="mt-6">
        <input type="hidden" name="t" value={t} />
        <button type="submit" className="btn-primary">
          Não quero mais estes lembretes
        </button>
      </form>
    </PaginaLegal>
  );
}
