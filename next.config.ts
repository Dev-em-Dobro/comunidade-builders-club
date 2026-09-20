import type { NextConfig } from "next";
import path from "path";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    optimizePackageImports: ["better-auth"],
    /** Client navigations reusam RSC por alguns segundos — menos “5s a cada clique”. */
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    /**
     * F095 — allowlist. Com `hostname: "**"`, `/_next/image` era um proxy de
     * imagem aberto: qualquer um usava o domínio e a quota da casa para buscar
     * imagem de qualquer host.
     *
     * Espelha `src/lib/images/hosts.ts`, que é quem o render consulta antes de
     * chamar `next/image` — mexeu aqui, mexe lá.
     */
    remotePatterns: [
      // Uploads de post e avatar (`storeUpload` com `@vercel/blob`).
      // `**.x` não casa `x` pelado — por isso os dois, aqui e no Panda. As duas
      // formas são aceitas por `hosts.ts`, e uma lista mais curta que a de lá
      // faria `next/image` lançar justo no caso que o fallback deveria pegar.
      { protocol: "https", hostname: "public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      // Avatar do Google, gravado pelo Better Auth no login.
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Panda Video — capa e thumbnail de aula (Fase 2).
      { protocol: "https", hostname: "pandavideo.com.br" },
      { protocol: "https", hostname: "**.pandavideo.com.br" },
      // Dev: uploads locais servidos pelo próprio Next.
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      /**
       * F095 — `/aulas/*` é personalizada por membro: o embed do Panda só é
       * montado para quem pode assistir, e a página ainda carrega progresso,
       * `isAdmin` e a discussão com `viewerId`. Isto era
       * `public, max-age=86400, stale-while-revalidate=604800`, o que oferecia
       * a resposta de um aluno a qualquer cache compartilhado no caminho — e
       * sem `Set-Cookie` no RSC, some a heurística que costuma impedir um CDN
       * de guardar resposta autenticada.
       *
       * A performance que o header buscava vem do `unstable_cache` em
       * `listPublishedModules`: cacheia o catálogo (igual para todo mundo), não
       * o HTML do membro. Se faltar fôlego, o caminho é `private, max-age=…`,
       * nunca `public`.
       */
      {
        source: "/aulas/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
    ];
  },
};

export default nextConfig;
