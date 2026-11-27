// F127 — conteúdo do e-mail de acesso após a compra. Sem dependência de Next
// nem de envio: só monta assunto e texto, para dar para testar.

import { NOME_PRODUTO } from "@/lib/produto";

export type CompraEmail =
  | { tipo: "modulo"; tituloModulo: string }
  | { tipo: "pro" }
  | { tipo: "elite" };

export type ConteudoCompraEmail = {
  subject: string;
  /** Título dentro do e-mail (sem o nome do produto). */
  titulo: string;
  /** O que foi liberado, em uma ou duas frases. */
  liberado: string;
};

export function conteudoCompraEmail(compra: CompraEmail): ConteudoCompraEmail {
  if (compra.tipo === "modulo") {
    const titulo = compra.tituloModulo.trim();
    return {
      subject: `Seu acesso ao ${titulo} — ${NOME_PRODUTO}`,
      titulo: `Seu acesso ao ${titulo}`,
      liberado: `As aulas do ${titulo} já estão liberadas para você no ${NOME_PRODUTO}.`,
    };
  }
  if (compra.tipo === "pro") {
    return {
      subject: `Seu acesso PRO — ${NOME_PRODUTO}`,
      titulo: "Seu acesso PRO",
      liberado:
        "Seu plano PRO já está ativo: a formação completa, os materiais de apoio, todos os espaços da comunidade, a busca e o Orion.",
    };
  }
  return {
    subject: `Seu acesso Elite — ${NOME_PRODUTO}`,
    titulo: "Seu acesso Elite",
    liberado:
      "Seu plano Elite já está ativo: tudo do PRO, o grupo de WhatsApp, as lives exclusivas e o Modelo de CMS.",
  };
}

export const INSTRUCAO_LOGIN_COMPRA =
  "Não tem senha: você digita esse e-mail e recebe um código para entrar.";

/** E-mail em texto puro. `email` é o da compra; `loginUrl` é o `/login` do Club. */
export function textoCompraEmail(
  compra: CompraEmail,
  opts: { email: string; loginUrl: string },
): string {
  const c = conteudoCompraEmail(compra);
  return [
    `Olá,`,
    ``,
    c.liberado,
    ``,
    `Para entrar, use o e-mail da compra: ${opts.email}`,
    ``,
    opts.loginUrl,
    ``,
    INSTRUCAO_LOGIN_COMPRA,
    ``,
    `— ${NOME_PRODUTO}`,
  ].join("\n");
}
