import { Suspense } from "react";
import { redirect } from "next/navigation";
import { googleAuthEnabled } from "@/lib/auth";
import { getOptionalUser } from "@/lib/auth/require-user";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const user = await getOptionalUser();
  if (user) redirect("/");

  return (
    <Suspense fallback={<div className="mx-auto max-w-md p-8 text-sm text-muted">Carregando…</div>}>
      <LoginForm googleEnabled={googleAuthEnabled} />
    </Suspense>
  );
}
