import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "@/lib/auth/errors";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { ensureMemberBootstrap } from "@/lib/membership/bootstrap";
import { NOME_PRODUTO } from "@/lib/produto";
import { LogoutButton } from "@/components/logout-button";

export default async function AguardandoPage() {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof AuthError) redirect("/login");
    throw e;
  }

  await ensureMemberBootstrap(user.id, user.name, user.image);

  const membership = await prisma.membership.findUnique({
    where: { userId: user.id },
  });

  if (membership?.status === "active") {
    redirect("/");
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="font-[family-name:var(--font-outfit)] text-2xl font-bold">
          {NOME_PRODUTO}
        </p>
        <h1 className="mt-4 text-lg font-semibold">Aguardando ativação</h1>
        <p className="mt-2 text-sm text-muted">
          {membership?.status === "revoked"
            ? "Seu acesso foi revogado. Fale com um administrador."
            : "Sua conta foi criada. Um administrador precisa ativar seu membership para liberar o feed."}
        </p>
        <p className="mt-4 text-xs text-muted">Logado como {user.email}</p>
        <div className="mt-6 flex gap-2">
          <Link href="/aguardando" className="btn-outline">
            Atualizar
          </Link>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
