import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";
import { sendMagicLinkEmail, sendOtpEmail } from "@/lib/email";
import { NOME_PRODUTO } from "@/lib/produto";
import { ensureMemberBootstrap } from "@/lib/membership/bootstrap";
import { contextoAceiteDeHeaders } from "@/lib/membership/aceite-legal";
import { recordDeniedLoginIfUnauthorized } from "@/lib/admin/denied-logins";
import { loadAuthEnv } from "./env";

const env = loadAuthEnv();

export const auth = betterAuth({
  appName: NOME_PRODUTO,
  secret: env.secret,
  baseURL: env.baseURL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  /**
   * Evita hit no Postgres a cada navegação RSC.
   * Sessão válida é lida do cookie assinado (~5 min); o poll / route handlers
   * renovam o cookie (RSC sozinho não consegue Set-Cookie).
   */
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  socialProviders: env.google
    ? {
        google: {
          clientId: env.google.clientId,
          clientSecret: env.google.clientSecret,
          prompt: "select_account",
        },
      }
    : {},
  account: {
    accountLinking: {
      enabled: true,
      // Só Google é trusted — evita link automático de providers não verificados.
      trustedProviders: ["google"],
      allowDifferentEmails: false,
    },
  },
  databaseHooks: {
    user: {
      create: {
        /**
         * F058 — `ctx` traz os headers da request que criou a conta, e é aqui
         * que o aceite do **primeiro** acesso é gravado. Sem repassar isso, a
         * linha nascia sem IP e sem user-agent, e o `requireActiveMember`
         * seguinte já encontrava `termosVersao` em dia e não corrigia.
         */
        after: async (user, ctx) => {
          await ensureMemberBootstrap(
            user.id,
            user.name,
            user.image,
            user.email,
            contextoAceiteDeHeaders(ctx?.headers),
          );
          await recordDeniedLoginIfUnauthorized(user.email);
        },
      },
    },
  },
  plugins: [
    magicLink({
      expiresIn: 60 * 5,
      sendMagicLink: async ({ email, url }) => {
        await recordDeniedLoginIfUnauthorized(email);
        await sendMagicLinkEmail({ to: email, url });
      },
    }),
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 10,
      allowedAttempts: 3,
      disableSignUp: false,
      sendVerificationOTP: async ({ email, otp }) => {
        await sendOtpEmail({ to: email, otp });
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session["user"];

export const googleAuthEnabled = env.google !== null;
