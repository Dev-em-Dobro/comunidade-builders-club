import Link from "next/link";
import { NOME_PRODUTO } from "@/lib/produto";
import { countUnread } from "@/lib/notifications";
import { listSpaces } from "@/lib/spaces";
import { LogoutButton } from "@/components/logout-button";

export async function AppShell({
  children,
  userId,
  isAdmin,
  displayName,
}: {
  children: React.ReactNode;
  userId: string;
  isAdmin: boolean;
  displayName: string;
}) {
  const [spaces, unread] = await Promise.all([
    listSpaces(),
    countUnread(userId),
  ]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl gap-0 md:gap-8">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card/60 p-4 backdrop-blur md:flex">
        <Link
          href="/"
          className="font-[family-name:var(--font-outfit)] text-xl font-bold tracking-tight text-foreground"
        >
          {NOME_PRODUTO}
        </Link>
        <p className="mt-1 text-xs text-muted">Olá, {displayName}</p>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Spaces
          </p>
          {spaces.map((s) => (
            <Link
              key={s.id}
              href={`/spaces/${s.slug}`}
              className="rounded-lg px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-surface hover:text-foreground"
            >
              {s.name}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
          <Link href="/busca" className="btn-ghost justify-start">
            Busca
          </Link>
          <Link href="/notificacoes" className="btn-ghost justify-start">
            Notificações
            {unread > 0 ? (
              <span className="ml-2 rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
                {unread}
              </span>
            ) : null}
          </Link>
          <Link href="/perfil" className="btn-ghost justify-start">
            Perfil
          </Link>
          {isAdmin ? (
            <Link href="/admin" className="btn-ghost justify-start">
              Admin
            </Link>
          ) : null}
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:hidden">
          <Link
            href="/"
            className="font-[family-name:var(--font-outfit)] text-lg font-bold"
          >
            {NOME_PRODUTO}
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/busca" className="btn-ghost text-xs">
              Busca
            </Link>
            <Link href="/notificacoes" className="btn-ghost text-xs">
              Bell{unread > 0 ? ` (${unread})` : ""}
            </Link>
            <Link href="/perfil" className="btn-ghost text-xs">
              Eu
            </Link>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-border px-4 py-2 md:hidden">
          {spaces.map((s) => (
            <Link
              key={s.id}
              href={`/spaces/${s.slug}`}
              className="shrink-0 rounded-full bg-surface px-3 py-1 text-xs font-medium"
            >
              {s.name}
            </Link>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 md:px-0 md:py-8">{children}</main>
      </div>
    </div>
  );
}
