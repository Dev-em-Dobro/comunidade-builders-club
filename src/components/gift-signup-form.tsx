"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { completarCadastroPresenteAction } from "@/actions/gifts";
import { WELCOME_SPACE_SLUG } from "@/lib/spaces/constants";

type Step = "form" | "otp";

type Props = {
  headline?: string;
  subhead?: string;
  /** F066 — link de volta ao login (cadastro genérico). */
  alreadyMemberHref?: string;
};

export function GiftSignupForm({
  headline = "Crie sua conta e pegue os outros presentes",
  subhead = "Conta gratuita. Você recebe um código no e-mail e continua nesta tela.",
  alreadyMemberHref,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyHadAccount, setAlreadyHadAccount] = useState(false);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      if (err) {
        setError(err.message ?? "Não foi possível enviar o código.");
        return;
      }
      setStep("otp");
    } catch {
      setError("Não foi possível enviar o código.");
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const name = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();
      const { error: err } = await authClient.signIn.emailOtp({
        email,
        otp,
        name,
      });
      if (err) {
        setError(
          err.message === "OTP_EXPIRED"
            ? "Código expirado. Solicite um novo."
            : err.message === "INVALID_OTP"
              ? "Código inválido. Tente de novo."
              : err.message === "TOO_MANY_ATTEMPTS"
                ? "Muitas tentativas. Solicite um novo código."
                : (err.message ?? "Não foi possível entrar."),
        );
        return;
      }
      const result = await completarCadastroPresenteAction({
        firstName,
        lastName,
      });
      if (result.alreadyHadAccount) {
        setAlreadyHadAccount(true);
        window.setTimeout(() => router.refresh(), 2200);
        return;
      }
      /**
       * Cadastro novo vai direto para Boas-vindas. Antes era `router.refresh()`:
       * a pessoa continuava no rodapé da página do presente, sem scroll para a
       * mensagem de sucesso, sem saber que já estava dentro.
       */
      router.push(`/spaces/${WELCOME_SPACE_SLUG}`);
    } catch {
      setError("Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  if (alreadyHadAccount) {
    return (
      <div id="cadastro-presente" className="rounded-2xl border border-border/80 bg-card p-6">
        <p className="text-sm font-semibold text-foreground">
          Você já tem conta, entramos com ela
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Este e-mail já pertencia a um membro. A origem deste link não foi
          alterada.
        </p>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <form
        id="cadastro-presente"
        onSubmit={onVerify}
        className="rounded-2xl border border-border/80 bg-card p-6"
      >
        <p className="text-sm font-semibold text-foreground">
          Digite o código
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Enviamos um código de 6 dígitos para{" "}
          <strong className="text-foreground">{email}</strong>.
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">
          Não achou? Olhe em spam e em promoções.
        </p>
        <label className="mt-4 block text-xs font-medium text-muted">
          Código
          <input
            className="input mt-1.5 tracking-[0.3em]"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            minLength={6}
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
          />
        </label>
        {error ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="btn-primary mt-4 w-full"
          disabled={loading || otp.length !== 6}
        >
          {loading ? "Entrando…" : "Criar conta"}
        </button>
        <button
          type="button"
          className="btn-ghost mt-2 w-full text-xs"
          disabled={loading}
          onClick={() => {
            setStep("form");
            setOtp("");
            setError(null);
          }}
        >
          Voltar e usar outro e-mail
        </button>
      </form>
    );
  }

  return (
    <form
      id="cadastro-presente"
      onSubmit={onSend}
      className="rounded-2xl border border-border/80 bg-card p-6"
    >
      <p className="text-sm font-semibold text-foreground">
        {headline}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {subhead}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-muted">
          Nome
          <input
            className="input mt-1.5"
            required
            maxLength={60}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </label>
        <label className="text-xs font-medium text-muted">
          Sobrenome
          <input
            className="input mt-1.5"
            required
            maxLength={60}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </label>
      </div>
      <label className="mt-3 block text-xs font-medium text-muted">
        E-mail
        <input
          className="input mt-1.5"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="voce@email.com"
        />
      </label>
      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn-primary mt-4 w-full" disabled={loading}>
        {loading ? "Enviando…" : "Receber código"}
      </button>
      <p className="mt-3 text-center text-xs text-muted">
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
      {alreadyMemberHref ? (
        <p className="mt-4 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link
            href={alreadyMemberHref}
            className="font-semibold text-accent hover:underline"
          >
            Entrar
          </Link>
        </p>
      ) : null}
    </form>
  );
}
