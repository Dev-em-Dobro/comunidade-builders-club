import type { Metadata } from "next";
import { PaginaLegal } from "@/components/pagina-legal";
import { NOME_PRODUTO } from "@/lib/produto";
import { optOutRepliesEmailAction } from "@/actions/email-respostas";

export const metadata: Metadata = {
  title: `E-mails de respostas · ${NOME_PRODUTO}`,
  description: `Parar de receber e-mails quando alguém responde no ${NOME_PRODUTO}.`,
};

export default async function EmailRespostasPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; ok?: string; erro?: string }>;
}) {
  const { t, ok, erro } = await searchParams;

  if (ok === "1") {
    return (
      <PaginaLegal titulo="E-mails de respostas desligados">
        <p>
          Você não receberá mais e-mails quando alguém responder um post ou
          comentário seu. O sininho na comunidade continua igual.
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
          Este link de descadastro não é válido. Se ainda estiver recebendo
          e-mails de respostas, abra{" "}
          <a href="/configuracoes" className="font-medium text-accent hover:underline">
            Configurações
          </a>{" "}
          com a conta logada e desligue por lá.
        </p>
      </PaginaLegal>
    );
  }

  return (
    <PaginaLegal titulo="Parar e-mails de respostas">
      <p>
        Você deixa de receber e-mail quando alguém comenta no seu post,
        responde o seu comentário ou te menciona. Reações já não geram e-mail.
        O aviso in-app (sininho) continua.
      </p>
      <form action={optOutRepliesEmailAction} className="mt-6">
        <input type="hidden" name="t" value={t} />
        <button type="submit" className="btn-primary">
          Não quero mais estes e-mails
        </button>
      </form>
    </PaginaLegal>
  );
}
