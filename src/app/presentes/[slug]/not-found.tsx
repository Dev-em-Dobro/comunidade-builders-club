import Link from "next/link";
import { NOME_PRODUTO } from "@/lib/produto";

export default function PresenteNaoEncontrado() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {NOME_PRODUTO}
      </p>
      <h1 className="page-title mt-3">Presente não encontrado</h1>
      <p className="mt-3 text-sm text-muted">
        Este link pode estar incompleto ou o presente ainda não foi publicado.
      </p>
      <Link href="/login" className="btn-primary mt-8">
        Entrar na comunidade
      </Link>
    </div>
  );
}
