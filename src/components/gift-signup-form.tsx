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
  /**
   * F078 — para onde vai quem acabou de criar conta. Default é Boas-vindas
   * (F063); a pop-up da aula passa a aula, porque foi ela que foi prometida.
   * Só vale para cadastro **novo** — quem já tinha conta segue vendo a
   * mensagem de sempre, sem sair da página.
   */
  redirectTo?: string;
  /**
   * F078 — a pop-up monta um segundo `GiftSignupForm` na mesma página. Sem
   * isto os dois nasceriam com `id="cadastro-presente"`, e id duplicado é
   * HTML inválido: âncora e leitor de tela passam a apontar para o primeiro
   * que aparecer no DOM.
   */
  formId?: string;
  /**
   * F078 — a pop-up pede só o e-mail. Um campo em vez de três é a alavanca
   * mais barata que existe no topo do funil; o `displayName` cai no fallback
   * do bootstrap (o trecho antes do `@`) até a pessoa completar o perfil.
   *
   * O formulário do rodapé mantém `true`: ali a pessoa já leu o Presente
   * inteiro e o atrito de dois campos custa menos.
   */
  pedirNome?: boolean;
};

export function GiftSignupForm({
  /**
   * F063 — a razão do cadastro é a prova social, não "mais presentes":
   * o que converte é ver quem está fechando cliente.
   */
  headline = "Crie sua conta e veja quem está fechando cliente",
  subhead = "Conta gratuita. Você entra e lê as conquistas reais da comunidade: quem fechou, por quanto e como foi.",
  alreadyMemberHref,
  redirectTo,
  formId = "cadastro-presente",
  pedirNome = true,
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
      /**
       * F078 — sem nome, o campo não vai. Mandar string vazia faria o Better
       * Auth criar o usuário com `name: ""`, e aí o fallback do bootstrap
       * (`name || email.split("@")[0]`) perderia a chance de agir.
       */
      const { error: err } = await authClient.signIn.emailOtp({
        email,
        otp,
        ...(name ? { name } : {}),
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
      const result = await completarCadastroPresenteAction(
        pedirNome ? { firstName, lastName } : {},
      );
      if (result.alreadyHadAccount) {
        setAlreadyHadAccount(true);
        window.setTimeout(() => router.refresh(), 2200);
        return;
      }
      /**
       * Cadastro novo vai direto para Boas-vindas. Antes era `router.refresh()`:
       * a pessoa continuava no rodapé da página do presente, sem scroll para a
       * mensagem de sucesso, sem saber que já estava dentro.
       *
       * F078 — quem entrou pela pop-up da aula vai para a aula: entregar
       * Boas-vindas seria trocar o prêmio no meio do caminho.
       */
      router.push(redirectTo ?? `/spaces/${WELCOME_SPACE_SLUG}`);
    } catch {
      setError("Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  if (alreadyHadAccount) {
    return (
      <div id={formId} className="rounded-2xl border border-border/80 bg-card p-6">
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
        id={formId}
        onSubmit={onVerify}
        className="rounded-2xl border border-border/80 bg-card p-6"
        data-clarity-mask="true"
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
      id={formId}
      onSubmit={onSend}
      className="rounded-2xl border border-border/80 bg-card p-6"
      data-clarity-mask="true"
    >
      <p className="text-sm font-semibold text-foreground">
        {headline}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {subhead}
      </p>
      {pedirNome ? (
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
      ) : null}
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
      {/*
       * F078 — aba nova, obrigatoriamente. Na mesma aba, ler os Termos custa o
       * e-mail já digitado (e, na pop-up, a modal inteira). Ninguém volta para
       * recomeçar um cadastro: a leitura do documento legal viraria desistência.
       */}
      <p className="mt-3 text-center text-xs text-muted">
        Ao continuar, você concorda com os{" "}
        <a
          href="/termos"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Termos de Uso
        </a>{" "}
        e a{" "}
        <a
          href="/privacidade"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
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
