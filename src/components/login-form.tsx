"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { NOME_PRODUTO } from "@/lib/produto";
import { safeCallbackPath } from "@/lib/security/urls";

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
  const callbackUrl = safeCallbackPath(searchParams.get("callbackUrl"));
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
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
      />
      <div className="relative w-full max-w-md animate-[fadeIn_0.4s_ease-out]">
        <p className="font-[family-name:var(--font-outfit)] text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          {NOME_PRODUTO}
        </p>
        <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">
          A comunidade dos builders da Dev em Dobro — conversas, dúvidas e
          conquistas em um só lugar.
        </p>

        <div className="mt-8 rounded-2xl border border-border/80 bg-card p-7 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          {sent ? (
            <div>
              <p className="text-sm font-semibold text-foreground">
                Link enviado
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Enviamos um link para <strong className="text-foreground">{email}</strong>.
                Abra o e-mail para entrar. O link vale por poucos minutos.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium text-foreground">
                Entre na comunidade
              </p>
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

              {googleEnabled ? (
                <p className="text-center text-xs text-muted">ou use e-mail</p>
              ) : null}

              <form onSubmit={onMagicLink} className="flex flex-col gap-3">
                <label className="text-xs font-medium text-muted">
                  E-mail
                  <input
                    className="input mt-1.5"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                  />
                </label>
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? "Enviando…" : "Receber magic link"}
                </button>
              </form>

              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <p className="pt-2 text-center text-xs text-muted">
                Ao continuar, você concorda com os{" "}
                <a href="/termos" className="text-accent hover:underline">
                  Termos de Uso
                </a>{" "}
                e a{" "}
                <a href="/privacidade" className="text-accent hover:underline">
                  Política de Privacidade
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
