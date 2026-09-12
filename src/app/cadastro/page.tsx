import { redirect } from "next/navigation";
import { AuthSplitLayout } from "@/components/auth-split-layout";
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
    <AuthSplitLayout>
      {/*
       * F067 — o ganho antes do mecanismo: primeiro o que ela leva, depois o
       * código de 6 dígitos. F086 juntou a antiga descrição da página ao
       * `subhead`; na coluna estreita, dois blocos de texto antes do primeiro
       * campo empurravam o formulário para fora da tela.
       */}
      <GiftSignupForm
        variant="plain"
        headline="Crie sua conta grátis"
        subhead="Grátis: as primeiras aulas da formação, o feed com o que a comunidade está fechando e os presentes liberados. Sem senha — enviamos um código de 6 dígitos para o seu e-mail."
        alreadyMemberHref="/login"
      />
    </AuthSplitLayout>
  );
}
