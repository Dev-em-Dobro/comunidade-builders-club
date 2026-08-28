import { redirect } from "next/navigation";
import { NOME_PRODUTO } from "@/lib/produto";
import { ThemeToggle } from "@/components/theme-toggle";
import { GiftSignupForm } from "@/components/gift-signup-form";
import { getOptionalUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Criar conta grátis",
  description:
    "Crie sua conta gratuita no Builders Club. Sem senha — você recebe um código no e-mail.",
};

export default async function CadastroPage() {
  const user = await getOptionalUser();
  if (user) redirect("/");

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle variant="icon" />
      </div>
      <main className="relative w-full max-w-md animate-[fadeIn_0.4s_ease-out]">
        <p className="font-[family-name:var(--font-outfit)] text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          {NOME_PRODUTO}
        </p>
        <h1 className="page-title mt-4">Crie sua conta no Builders Club</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Conta gratuita. Sem senha — enviamos um código de 6 dígitos para o
          seu e-mail.
        </p>
        <div className="mt-8">
          <GiftSignupForm
            headline="Criar conta grátis"
            subhead="Nome, e-mail e o código que chega na caixa de entrada."
            alreadyMemberHref="/login"
          />
        </div>
      </main>
    </div>
  );
}
