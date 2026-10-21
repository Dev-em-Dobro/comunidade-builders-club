/** F115 — termos Elite aprovados pelos fundadores em 2026-10-21. */
export const DOCUMENTO_TERMOS_ELITE = "termos-elite" as const;
export const VERSAO_TERMOS_ELITE = "2026-10-21";

/** A data compõe a chave do aceite porque o prazo exibido é individual. */
export function versaoAceiteTermosElite(inicio: Date | null): string {
  return `${VERSAO_TERMOS_ELITE}@${inicio?.toISOString() ?? "sem-data"}`;
}

const dataCompra = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dataCivil = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function datasAcompanhamentoElite(inicio: Date | null): {
  compra: string;
  termino: string;
} | null {
  if (!inicio || Number.isNaN(inicio.getTime())) return null;
  const parts = dataCompra.formatToParts(inicio);
  const numero = (type: "day" | "month" | "year") =>
    Number(parts.find((part) => part.type === type)?.value);
  const dia = numero("day");
  const mes = numero("month");
  const ano = numero("year");
  const aniversario = new Date(Date.UTC(ano + 1, mes - 1, dia));
  return {
    compra: dataCompra.format(inicio),
    termino: dataCivil.format(aniversario),
  };
}
