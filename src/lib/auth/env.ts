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
  const google =
    clientId && clientSecret ? { clientId, clientSecret } : null;

  return { secret, baseURL, google };
}
