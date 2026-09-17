/**
 * F090 — Lista da garantia (Elite), versionada.
 *
 * Texto espelha o processo Dobro OS `bc-regua-garantia`. Mudou o texto?
 * Bumpe `VERSAO_GARANTIA` — o ciente é por versão.
 */

export const DOCUMENTO_GARANTIA = "garantia" as const;

/** Bumpe ao alterar a lista ou as regras publicadas. */
export const VERSAO_GARANTIA = "2026-09-17";

export type ItemGarantia = {
  numero: number;
  titulo: string;
  detalhe: string;
};

export const LISTA_GARANTIA: readonly ItemGarantia[] = [
  {
    numero: 1,
    titulo: "Fase 1 concluída (M01 a M05)",
    detalhe: "100% dos módulos da primeira fase na plataforma.",
  },
  {
    numero: 2,
    titulo: "Nicho escolhido",
    detalhe: "Um nicho definido (perfil ou amostra).",
  },
  {
    numero: 3,
    titulo: "Amostra no ar",
    detalhe: "Um site/amostra com URL pública.",
  },
  {
    numero: 4,
    titulo: "100 leads no Orion",
    detalhe: "Prospecção registrada no Orion.",
  },
  {
    numero: 5,
    titulo: "100 abordagens enviadas",
    detalhe: "Quente, presencial, Orion ou indicação — com prova.",
  },
  {
    numero: 6,
    titulo: "Lista quente ou visitas",
    detalhe: "20 contatos quentes ou 3 visitas presenciais.",
  },
  {
    numero: 7,
    titulo: "20 propostas — ou follow-up documentado",
    detalhe:
      "20 propostas com preço, ou as 100 abordagens com 2 tentativas por lead sem resposta.",
  },
  {
    numero: 8,
    titulo: "Pedido de ajuda na comunidade",
    detalhe: "Pelo menos um pedido de ajuda quando travou.",
  },
] as const;

export const GARANTIA_RESUMO_CURTO =
  "Elite: se você cumprir a lista de execução em 90 dias e não fechar um cliente, devolvemos 100%.";

export const PROMESSA_ELITE =
  "Garantia de 90 dias condicionada à lista de execução";

/** Pro: meta sem garantia de resultado. */
export const PROMESSA_PRO =
  "Formação e comunidade pra você fechar o 1º cliente";
