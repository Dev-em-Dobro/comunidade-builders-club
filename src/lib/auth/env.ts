function presente(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v && v.length > 0 ? v : undefined;
}

export function requireAuthEnv(name: string): string {
  const v = presente(name);
  if (!v) {
    throw new Error(`[auth] Env obrigatória ausente: ${name}`);
  }
  return v;
}

export type AuthEnv = {
  secret: string;
  baseURL: string;
  google: { clientId: string; clientSecret: string } | null;
};

export function loadAuthEnv(): AuthEnv {
  const secret = presente("BETTER_AUTH_SECRET");
  if (!secret) {
    throw new Error("[auth] BETTER_AUTH_SECRET ausente — sem default.");
  }
  const baseURL = presente("BETTER_AUTH_URL");
  if (!baseURL) {
    throw new Error("[auth] BETTER_AUTH_URL ausente — sem default.");
  }

  const clientId = presente("GOOGLE_CLIENT_ID");
  const clientSecret = presente("GOOGLE_CLIENT_SECRET");

  /**
   * F095 — as duas ou nenhuma. Nenhuma é configuração legítima: o login segue
   * por magic link e OTP. Só uma era degradação silenciosa — o botão do Google
   * sumia sem que nada reclamasse, e o sintoma aparecia em produção como
   * "ninguém consegue entrar com Google".
   */
  if (Boolean(clientId) !== Boolean(clientSecret)) {
    const ausente = clientId ? "GOOGLE_CLIENT_SECRET" : "GOOGLE_CLIENT_ID";
    throw new Error(
      `[auth] ${ausente} ausente — configure as duas envs do Google ou nenhuma.`,
    );
  }

  const google =
    clientId && clientSecret ? { clientId, clientSecret } : null;

  return { secret, baseURL, google };
}
