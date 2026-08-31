/** Conteúdo compartilhado das páginas legais (LGPD). */

import { NOME_PRODUTO } from "@/lib/produto";

export const OPERADOR_LEGAL = {
  /** Nome do operador responsável pelo tratamento. */
  nome: "Dev em Dobro",
  /** Contato do titular de dados / DPO operacional. */
  emailPrivacidade: "suportedevquest@gmail.com",
  produto: NOME_PRODUTO,
} as const;

/**
 * F058 — versão dos documentos legais. **Mude isto sempre que o texto de
 * `/termos` ou `/privacidade` mudar**: é sob esta versão que o aceite de cada
 * membro é registrado.
 *
 * O texto legal mora no código, então o histórico do git prova o que cada
 * versão dizia — não é preciso guardar cópia do texto para comprovar o aceite.
 */
export const VERSAO_LEGAL = "2026-08-31";

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

/**
 * Data exibida nas páginas legais, derivada da versão — assim não dá para
 * publicar texto novo com data velha, nem registrar aceite de versão errada.
 *
 * Sem `Date`: parse de "2026-08-24" varia com fuso e viraria dia 23 em servidor
 * a oeste de Greenwich.
 */
function dataPorExtenso(versao: string): string {
  const [ano, mes, dia] = versao.split("-");
  const nomeMes = MESES[Number(mes) - 1];
  if (!ano || !dia || !nomeMes) return versao;
  return `${Number(dia)} de ${nomeMes} de ${ano}`;
}

export const ATUALIZADO_EM = dataPorExtenso(VERSAO_LEGAL);

/** Documentos cujo aceite é registrado. */
export const DOCUMENTOS_LEGAIS = ["termos", "privacidade"] as const;

export type DocumentoLegal = (typeof DOCUMENTOS_LEGAIS)[number];
