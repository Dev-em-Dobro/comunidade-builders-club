/** Conteúdo compartilhado das páginas legais (LGPD). */

import { NOME_PRODUTO } from "@/lib/produto";

export const OPERADOR_LEGAL = {
  /** Nome do operador responsável pelo tratamento. */
  nome: "Dev em Dobro",
  /** Contato do titular de dados / DPO operacional. */
  emailPrivacidade: "suportedevquest@gmail.com",
  produto: NOME_PRODUTO,
} as const;

export const ATUALIZADO_EM = "3 de agosto de 2026";

/**
 * F058 — versão dos documentos legais. Muda junto com `ATUALIZADO_EM`.
 *
 * O texto legal mora no código, então o histórico do git prova o que cada
 * versão dizia — não é preciso guardar cópia do texto para comprovar o aceite.
 */
export const VERSAO_LEGAL = "2026-08-03";

/** Documentos cujo aceite é registrado. */
export const DOCUMENTOS_LEGAIS = ["termos", "privacidade"] as const;

export type DocumentoLegal = (typeof DOCUMENTOS_LEGAIS)[number];
