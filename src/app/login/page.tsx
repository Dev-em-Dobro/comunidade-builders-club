import { Suspense } from "react";
import { redirect } from "next/navigation";
import { googleAuthEnabled } from "@/lib/auth";
import { getOptionalUser } from "@/lib/auth/require-user";
import { AuthSplitLayout } from "@/components/auth-split-layout";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const user = await getOptionalUser();
  if (user) redirect("/");

  return (
    <AuthSplitLayout>
      <Suspense
        fallback={<p className="text-sm text-muted">Carregando…</p>}
      >
        <LoginForm googleEnabled={googleAuthEnabled} />
      </Suspense>
    </AuthSplitLayout>
  );
}
