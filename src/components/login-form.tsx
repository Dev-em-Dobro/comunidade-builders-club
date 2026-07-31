"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { NOME_PRODUTO } from "@/lib/produto";

function mensagemErroCallback(code: string | null): string | null {
  if (!code) return null;
  const mapa: Record<string, string> = {
    INVALID_TOKEN: "Link inválido ou já usado. Solicite um novo.",
    EXPIRED_TOKEN: "Link expirado. Solicite um novo pelo e-mail.",
    TOKEN_EXPIRED: "Link expirado. Solicite um novo pelo e-mail.",
    oauth: "Não foi possível entrar com Google. Tente de novo.",
  };
  return (
    mapa[code] ??
    "Não foi possível concluir o login. Tente de novo ou use outro método."
  );
}

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const erroCallback = useMemo(
    () => mensagemErroCallback(searchParams.get("error")),
    [searchParams],
  );

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(erroCallback);
  const [loading, setLoading] = useState(false);

  async function onMagicLink(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await authClient.signIn.magicLink({
        email,
        callbackURL: callbackUrl,
        // Falha de token volta pro login (não pra home com ?error=)
        errorCallbackURL: `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      });
      if (err) {
        setError(err.message ?? "Falha ao enviar link.");
        return;
      }
      setSent(true);
    } catch {
      setError("Falha ao enviar link.");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setLoading(true);
    setError(null);
    const { error: err } = await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
      errorCallbackURL: `/login?error=oauth&callbackUrl=${encodeURIComponent(callbackUrl)}`,
    });
    if (err) {
      setError(err.message ?? "Falha ao iniciar login com Google.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="font-[family-name:var(--font-outfit)] text-3xl font-bold tracking-tight">
          {NOME_PRODUTO}
        </p>
        <p className="mt-2 text-sm text-muted">
          Entre para acessar a comunidade dos builders.
        </p>

        {sent ? (
          <p className="mt-8 text-sm text-foreground">
            Enviamos um link para <strong>{email}</strong>. Abra o e-mail para
            entrar.
          </p>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {googleEnabled ? (
              <button
                type="button"
                className="btn-outline w-full"
                disabled={loading}
                onClick={onGoogle}
              >
                Entrar com Google
              </button>
            ) : null}

            <form onSubmit={onMagicLink} className="flex flex-col gap-3">
              <label className="text-xs font-medium text-muted">
                E-mail (magic link)
                <input
                  className="input mt-1"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                />
              </label>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Enviando…" : "Receber link"}
              </button>
            </form>

            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
