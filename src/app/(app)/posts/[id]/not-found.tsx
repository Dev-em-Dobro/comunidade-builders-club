import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="feed-wrap flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        Post indisponível
      </p>
      <h1 className="page-title mt-3">Publicação não encontrada</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        Este post pode ter sido removido pelo autor ou por um administrador, ou
        o link está incorreto.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary">
          Ir ao feed
        </Link>
        <Link href="/busca" className="btn-outline">
          Buscar na comunidade
        </Link>
      </div>
    </div>
  );
}
