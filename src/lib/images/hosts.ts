/**
 * F095 — hosts que podem passar pelo otimizador do Next (`/_next/image`).
 *
 * O `remotePatterns` com `hostname: "**"` transformava a rota num proxy de
 * imagem aberto: qualquer pessoa usava o domínio e a quota da casa para buscar
 * imagem de qualquer host da internet.
 *
 * A lista aqui e a de `next.config.ts` dizem a mesma coisa para públicos
 * diferentes — o config configura o otimizador, este módulo deixa a mesma regra
 * disponível para o render decidir **antes** de chamar `next/image`. Precisam
 * andar juntas; mexeu numa, mexe na outra.
 *
 * Por que o render precisa saber: as URLs vêm do banco (`User.image`,
 * `Profile.avatarUrl`, `Post.imageUrl`, `Module.coverImageUrl`,
 * `Lesson.thumbnailUrl`) e `next/image` com host fora da lista **lança**, o que
 * derrubaria a página inteira por causa de uma capa antiga. Com o teste feito
 * aqui, host desconhecido cai num `<img>` comum e só perde a otimização.
 */

/** Sufixos de host aceitos. `.` na frente = o host e seus subdomínios. */
const HOSTS_OTIMIZAVEIS = [
  /** Uploads de post e avatar — `storeUpload` com `@vercel/blob`. */
  ".public.blob.vercel-storage.com",
  /** Avatar do Google, gravado pelo Better Auth no login. */
  "lh3.googleusercontent.com",
  /** Panda Video — capa e thumbnail de aula (Fase 2). */
  ".pandavideo.com.br",
] as const;

/** Dev: uploads locais servidos pelo próprio Next. */
const HOSTS_DEV = ["localhost", "127.0.0.1"] as const;

function hostPermitido(hostname: string): boolean {
  const host = hostname.toLowerCase();

  if ((HOSTS_DEV as readonly string[]).includes(host)) return true;

  return HOSTS_OTIMIZAVEIS.some((padrao) =>
    padrao.startsWith(".")
      ? host === padrao.slice(1) || host.endsWith(padrao)
      : host === padrao,
  );
}

/**
 * `true` quando o `src` pode ir para `next/image`.
 *
 * URL relativa (`/uploads/…`) é sempre otimizável: é servida por este próprio
 * app, nunca sai para a internet.
 */
export function podeOtimizarImagem(src: string): boolean {
  const valor = src.trim();
  if (!valor) return false;

  // Relativa — mesma origem. `//host/x` NÃO entra aqui: é protocol-relative.
  if (valor.startsWith("/") && !valor.startsWith("//")) return true;

  let url: URL;
  try {
    url = new URL(valor);
  } catch {
    return false;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return false;

  return hostPermitido(url.hostname);
}
